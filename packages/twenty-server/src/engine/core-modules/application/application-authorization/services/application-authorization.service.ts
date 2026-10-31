import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { isDefined } from 'twenty-shared/utils';
import { IsNull, Repository } from 'typeorm';

import { ApplicationAuthorizationEntity } from 'src/engine/core-modules/application/application-authorization/application-authorization.entity';
import { ApplicationEntity } from 'src/engine/core-modules/application/application.entity';
import { getWellKnownOAuthClientOfRegistration } from 'src/engine/core-modules/application/well-known-oauth-client/utils/get-well-known-oauth-client-of-registration.util';
import { InjectWorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/inject-workspace-scoped-repository.decorator';
import { WorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/workspace-scoped-repository';

const getWellKnownOAuthClientOfApplication = (
  application: Pick<ApplicationEntity, 'applicationRegistration'>,
) =>
  isDefined(application.applicationRegistration)
    ? getWellKnownOAuthClientOfRegistration(application.applicationRegistration)
        ?.client
    : undefined;

@Injectable()
export class ApplicationAuthorizationService {
  constructor(
    @InjectRepository(ApplicationAuthorizationEntity)
    private readonly applicationAuthorizationRepository: Repository<ApplicationAuthorizationEntity>,
    @InjectWorkspaceScopedRepository(ApplicationEntity)
    private readonly applicationRepository: WorkspaceScopedRepository<ApplicationEntity>,
  ) {}

  async recordAuthorization({
    userId,
    workspaceId,
    userWorkspaceId,
    applicationId,
    scopes,
  }: {
    userId: string;
    workspaceId: string;
    userWorkspaceId: string;
    applicationId: string;
    scopes: string[];
  }): Promise<void> {
    const now = new Date();

    await this.applicationAuthorizationRepository.upsert(
      {
        userId,
        workspaceId,
        userWorkspaceId,
        applicationId,
        scopes,
        lastAuthorizedAt: now,
        lastUsedAt: now,
        revokedAt: null,
      },
      {
        conflictPaths: ['userId', 'applicationId'],
        skipUpdateIfNoValuesChanged: false,
      },
    );
  }

  // Scopes and consent time stay null: pre-table refresh tokens carry neither, and today's declared scopes prove nothing.
  // Insert-only, so it never overwrites a row written by a real consent.
  async backfillAuthorizationFromRefreshToken({
    userId,
    workspaceId,
    userWorkspaceId,
    applicationId,
  }: {
    userId: string;
    workspaceId: string;
    userWorkspaceId: string;
    applicationId: string;
  }): Promise<void> {
    await this.applicationAuthorizationRepository
      .createQueryBuilder()
      .insert()
      .values({
        userId,
        workspaceId,
        userWorkspaceId,
        applicationId,
        scopes: null,
        lastAuthorizedAt: null,
        lastUsedAt: new Date(),
        revokedAt: null,
      })
      .orIgnore()
      .execute();
  }

  // Includes revoked rows: callers must tell "never authorized" from "revoked"
  async findByUserAndApplication({
    userId,
    applicationId,
  }: {
    userId: string;
    applicationId: string;
  }): Promise<ApplicationAuthorizationEntity | null> {
    return await this.applicationAuthorizationRepository.findOneBy({
      userId,
      applicationId,
    });
  }

  // Inner join drops authorizations of soft-deleted applications
  async findActiveAuthorizationsForUserWorkspace({
    userId,
    workspaceId,
  }: {
    userId: string;
    workspaceId: string;
  }): Promise<ApplicationAuthorizationEntity[]> {
    return await this.applicationAuthorizationRepository
      .createQueryBuilder('applicationAuthorization')
      .innerJoinAndSelect('applicationAuthorization.application', 'application')
      .leftJoinAndSelect(
        'application.applicationRegistration',
        'applicationRegistration',
      )
      .where('applicationAuthorization.userId = :userId', { userId })
      .andWhere('applicationAuthorization.workspaceId = :workspaceId', {
        workspaceId,
      })
      .andWhere('applicationAuthorization.revokedAt IS NULL')
      .orderBy('applicationAuthorization.lastUsedAt', 'DESC')
      .getMany();
  }

  // Connections made before a well-known client had its seeded registration installed their own copies,
  // so the client's members are gathered across every install the server attributes to it
  async findActiveAuthorizationsForWorkspaceApplication({
    workspaceId,
    applicationId,
  }: {
    workspaceId: string;
    applicationId: string;
  }): Promise<ApplicationAuthorizationEntity[]> {
    const application = await this.applicationRepository.findOne(workspaceId, {
      where: { id: applicationId },
      relations: ['applicationRegistration'],
    });

    if (!isDefined(application)) {
      return [];
    }

    const wellKnownOAuthClient =
      getWellKnownOAuthClientOfApplication(application);

    const workspaceAuthorizations =
      await this.applicationAuthorizationRepository
        .createQueryBuilder('applicationAuthorization')
        .innerJoinAndSelect(
          'applicationAuthorization.application',
          'application',
        )
        .leftJoinAndSelect(
          'application.applicationRegistration',
          'applicationRegistration',
        )
        .where('applicationAuthorization.workspaceId = :workspaceId', {
          workspaceId,
        })
        .andWhere('applicationAuthorization.revokedAt IS NULL')
        .orderBy('applicationAuthorization.lastUsedAt', 'DESC')
        .getMany();

    return workspaceAuthorizations.filter(
      (authorization) =>
        authorization.applicationId === applicationId ||
        (isDefined(wellKnownOAuthClient) &&
          getWellKnownOAuthClientOfApplication(authorization.application) ===
            wellKnownOAuthClient),
    );
  }

  async touchLastUsedAt(authorizationId: string): Promise<void> {
    await this.applicationAuthorizationRepository.update(
      { id: authorizationId },
      { lastUsedAt: new Date() },
    );
  }

  // Scoped in the UPDATE itself so a guessed id cannot revoke someone else's authorization
  async revokeAuthorizationByIdForUserWorkspace({
    authorizationId,
    userId,
    workspaceId,
  }: {
    authorizationId: string;
    userId: string;
    workspaceId: string;
  }): Promise<boolean> {
    return await this.revokeMatching({
      id: authorizationId,
      userId,
      workspaceId,
    });
  }

  async revokeAuthorizationByIdForWorkspace({
    authorizationId,
    workspaceId,
  }: {
    authorizationId: string;
    workspaceId: string;
  }): Promise<boolean> {
    return await this.revokeMatching({ id: authorizationId, workspaceId });
  }

  async revokeAuthorizationForApplication({
    userId,
    applicationId,
  }: {
    userId: string;
    applicationId: string;
  }): Promise<boolean> {
    return await this.revokeMatching({ userId, applicationId });
  }

  // The union rules out empty criteria, which would revoke every row
  private async revokeMatching(
    criteria:
      | { id: string; userId: string; workspaceId: string }
      | { id: string; workspaceId: string }
      | { userId: string; applicationId: string },
  ): Promise<boolean> {
    const { affected } = await this.applicationAuthorizationRepository.update(
      { ...criteria, revokedAt: IsNull() },
      { revokedAt: new Date() },
    );

    return isDefined(affected) && affected > 0;
  }
}
