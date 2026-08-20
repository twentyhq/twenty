import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { isDefined } from 'twenty-shared/utils';
import { IsNull, Repository } from 'typeorm';

import { ApplicationAuthorizationEntity } from 'src/engine/core-modules/application/application-authorization/application-authorization.entity';

@Injectable()
export class ApplicationAuthorizationService {
  constructor(
    @InjectRepository(ApplicationAuthorizationEntity)
    private readonly applicationAuthorizationRepository: Repository<ApplicationAuthorizationEntity>,
  ) {}

  // Re-authorizing an application the user previously revoked reinstates the
  // same row: they have just consented again, so the revocation is spent.
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

  // Stands in for the consent event that happened before this table existed.
  // The refresh token proves the authorization took place but carries no scope
  // claim and no timestamp for it, so both are left null instead of being
  // guessed from what the application declares today. Insert-only, so it can
  // never overwrite a row written by a real consent.
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

  // Returns revoked rows too: the caller has to tell "never authorized" apart
  // from "authorized then revoked", which are opposite answers.
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

  // Inner join, so an application that has been soft-deleted takes its
  // authorizations off the list rather than surfacing them with nothing to
  // name them.
  // Scoped to one workspace: an authorization grants an application access to
  // this workspace's data, so it is this workspace's to list and revoke. The
  // same person's grants elsewhere are not visible from here.
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
      .where('applicationAuthorization.userId = :userId', { userId })
      .andWhere('applicationAuthorization.workspaceId = :workspaceId', {
        workspaceId,
      })
      .andWhere('applicationAuthorization.revokedAt IS NULL')
      .orderBy('applicationAuthorization.lastUsedAt', 'DESC')
      .getMany();
  }

  async touchLastUsedAt(authorizationId: string): Promise<void> {
    await this.applicationAuthorizationRepository.update(
      { id: authorizationId },
      { lastUsedAt: new Date() },
    );
  }

  // Scoped in the UPDATE itself rather than read-then-write, so one user can
  // never revoke another user's authorization, or their own in another
  // workspace, by guessing an id.
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

  async revokeAuthorizationForApplication({
    userId,
    applicationId,
  }: {
    userId: string;
    applicationId: string;
  }): Promise<boolean> {
    return await this.revokeMatching({ userId, applicationId });
  }

  // Returns whether this call was the one that revoked it, so a repeated
  // revocation reports false rather than moving revokedAt forward. The union
  // rules out an empty criteria object, which would revoke every row.
  private async revokeMatching(
    criteria:
      | { id: string; userId: string; workspaceId: string }
      | { userId: string; applicationId: string },
  ): Promise<boolean> {
    const { affected } = await this.applicationAuthorizationRepository.update(
      { ...criteria, revokedAt: IsNull() },
      { revokedAt: new Date() },
    );

    return isDefined(affected) && affected > 0;
  }
}
