import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { isDefined } from 'twenty-shared/utils';
import { type FindOperator, In, IsNull, Repository } from 'typeorm';
import { v4 } from 'uuid';

import { ApplicationAuthorizationEntity } from 'src/engine/core-modules/application/application-authorization/application-authorization.entity';
import { ApplicationEntity } from 'src/engine/core-modules/application/application.entity';
import { WellKnownOAuthClientInstallService } from 'src/engine/core-modules/application/well-known-oauth-client/services/well-known-oauth-client-install.service';
import { UserWorkspaceEntity } from 'src/engine/core-modules/user-workspace/user-workspace.entity';
import { InjectWorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/inject-workspace-scoped-repository.decorator';
import { WorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/workspace-scoped-repository';

@Injectable()
export class ApplicationAuthorizationService {
  constructor(
    @InjectRepository(ApplicationAuthorizationEntity)
    private readonly applicationAuthorizationRepository: Repository<ApplicationAuthorizationEntity>,
    @InjectRepository(UserWorkspaceEntity)
    private readonly userWorkspaceRepository: Repository<UserWorkspaceEntity>,
    @InjectWorkspaceScopedRepository(ApplicationEntity)
    private readonly applicationRepository: WorkspaceScopedRepository<ApplicationEntity>,
    private readonly wellKnownOAuthClientInstallService: WellKnownOAuthClientInstallService,
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
  }): Promise<string> {
    const now = new Date();
    const consentId = v4();

    await this.applicationAuthorizationRepository.upsert(
      {
        userId,
        workspaceId,
        userWorkspaceId,
        applicationId,
        scopes,
        lastAuthorizedAt: now,
        consentId,
        lastUsedAt: now,
        revokedAt: null,
      },
      {
        conflictPaths: ['userId', 'applicationId'],
        skipUpdateIfNoValuesChanged: false,
      },
    );

    return consentId;
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

  async findActiveAuthorizationsForUserWorkspace({
    userId,
    workspaceId,
  }: {
    userId: string;
    workspaceId: string;
  }): Promise<ApplicationAuthorizationEntity[]> {
    return await this.createActiveAuthorizationsQueryBuilder(workspaceId)
      .andWhere('applicationAuthorization.userId = :userId', { userId })
      .getMany();
  }

  async findActiveAuthorizationsForWorkspaceApplication({
    workspaceId,
    applicationId,
  }: {
    workspaceId: string;
    applicationId: string;
  }): Promise<ApplicationAuthorizationEntity[]> {
    const applicationIds =
      await this.wellKnownOAuthClientInstallService.findFoldedApplicationIds({
        workspaceId,
        applicationId,
      });

    return await this.createActiveAuthorizationsQueryBuilder(workspaceId)
      .andWhere(
        'applicationAuthorization.applicationId IN (:...applicationIds)',
        {
          applicationIds,
        },
      )
      .getMany();
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

  async revokeMemberAuthorizationsForWorkspaceApplication({
    workspaceId,
    applicationId,
    userId,
  }: {
    workspaceId: string;
    applicationId: string;
    userId: string;
  }): Promise<boolean> {
    const applicationIds =
      await this.wellKnownOAuthClientInstallService.findFoldedApplicationIds({
        workspaceId,
        applicationId,
      });

    await this.backfillMemberAuthorizations({
      workspaceId,
      userId,
      applicationIds,
    });

    return await this.revokeMatching({
      workspaceId,
      userId,
      applicationId: In(applicationIds),
    });
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

  // Lays rows down first, or the refresh path would backfill a fresh active one for a pre-table token.
  // Only for installs of this workspace: the application id is caller input.
  private async backfillMemberAuthorizations({
    workspaceId,
    userId,
    applicationIds,
  }: {
    workspaceId: string;
    userId: string;
    applicationIds: string[];
  }): Promise<void> {
    const userWorkspace = await this.userWorkspaceRepository.findOne({
      where: { userId, workspaceId },
    });

    if (!isDefined(userWorkspace)) {
      return;
    }

    const installs = await this.applicationRepository.find(workspaceId, {
      select: { id: true },
      where: { id: In(applicationIds) },
    });

    await Promise.all(
      installs.map((install) =>
        this.backfillAuthorizationFromRefreshToken({
          userId,
          workspaceId,
          userWorkspaceId: userWorkspace.id,
          applicationId: install.id,
        }),
      ),
    );
  }

  private createActiveAuthorizationsQueryBuilder(workspaceId: string) {
    return this.applicationAuthorizationRepository
      .createQueryBuilder('applicationAuthorization')
      .innerJoinAndSelect('applicationAuthorization.application', 'application')
      .leftJoin(
        'application.applicationRegistration',
        'applicationRegistration',
      )
      .addSelect([
        'applicationRegistration.id',
        'applicationRegistration.universalIdentifier',
        'applicationRegistration.sourceType',
        'applicationRegistration.ownerWorkspaceId',
        'applicationRegistration.oAuthClientId',
        'applicationRegistration.oAuthRedirectUris',
      ])
      .where('applicationAuthorization.workspaceId = :workspaceId', {
        workspaceId,
      })
      .andWhere('applicationAuthorization.revokedAt IS NULL')
      .orderBy('applicationAuthorization.lastUsedAt', 'DESC');
  }

  // The union rules out empty criteria, which would revoke every row
  private async revokeMatching(
    criteria:
      | { id: string; userId: string; workspaceId: string }
      | {
          workspaceId: string;
          userId: string;
          applicationId: FindOperator<string>;
        }
      | { userId: string; applicationId: string },
  ): Promise<boolean> {
    const { affected } = await this.applicationAuthorizationRepository.update(
      { ...criteria, revokedAt: IsNull() },
      { revokedAt: new Date() },
    );

    return isDefined(affected) && affected > 0;
  }
}
