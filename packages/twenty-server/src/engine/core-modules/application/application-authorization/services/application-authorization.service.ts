import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { isNonEmptyString } from '@sniptt/guards';
import { isDefined } from 'twenty-shared/utils';
import { IsNull, Repository } from 'typeorm';

import { CoreEntityCacheService } from 'src/engine/core-entity-cache/services/core-entity-cache.service';
import { ApplicationAuthorizationEntity } from 'src/engine/core-modules/application/application-authorization/application-authorization.entity';
import { isApplicationAccessTokenAuthorized } from 'src/engine/core-modules/application/application-authorization/utils/is-application-access-token-authorized.util';
import { type ApplicationAccessTokenJwtPayload } from 'src/engine/core-modules/auth/types/application-access-token-jwt-payload.type';

@Injectable()
export class ApplicationAuthorizationService {
  constructor(
    @InjectRepository(ApplicationAuthorizationEntity)
    private readonly applicationAuthorizationRepository: Repository<ApplicationAuthorizationEntity>,
    private readonly coreEntityCacheService: CoreEntityCacheService,
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

    // Authorizing on top of an active authorization keeps its start, so the member's other sessions keep refreshing
    const { affected } = await this.applicationAuthorizationRepository.update(
      { userId, applicationId, revokedAt: IsNull() },
      { workspaceId, userWorkspaceId, scopes, lastUsedAt: now },
    );

    if (isDefined(affected) && affected > 0) {
      return await this.findIdByUserAndApplicationOrThrow({
        userId,
        applicationId,
      });
    }

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

    const authorizationId = await this.findIdByUserAndApplicationOrThrow({
      userId,
      applicationId,
    });

    await this.coreEntityCacheService.invalidate(
      'applicationAuthorization',
      authorizationId,
    );

    return authorizationId;
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
  }): Promise<string> {
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

    return await this.findIdByUserAndApplicationOrThrow({
      userId,
      applicationId,
    });
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

  async findActiveAuthorizationsForWorkspace({
    workspaceId,
    applicationId,
  }: {
    workspaceId: string;
    applicationId?: string;
  }): Promise<ApplicationAuthorizationEntity[]> {
    const queryBuilder = this.applicationAuthorizationRepository
      .createQueryBuilder('applicationAuthorization')
      .innerJoinAndSelect('applicationAuthorization.application', 'application')
      .leftJoinAndSelect(
        'application.applicationRegistration',
        'applicationRegistration',
      )
      .where('applicationAuthorization.workspaceId = :workspaceId', {
        workspaceId,
      })
      .andWhere('applicationAuthorization.revokedAt IS NULL');

    if (isDefined(applicationId)) {
      queryBuilder.andWhere(
        'applicationAuthorization.applicationId = :applicationId',
        { applicationId },
      );
    }

    return await queryBuilder
      .orderBy('applicationAuthorization.lastUsedAt', 'DESC')
      .getMany();
  }

  // Inner join drops authorizations of soft-deleted applications, as in the listings
  async countActiveAuthorizationsByApplicationForWorkspace({
    workspaceId,
  }: {
    workspaceId: string;
  }): Promise<{ applicationId: string; connectedMemberCount: number }[]> {
    const rows = await this.applicationAuthorizationRepository
      .createQueryBuilder('applicationAuthorization')
      .innerJoin('applicationAuthorization.application', 'application')
      .select('applicationAuthorization.applicationId', 'applicationId')
      .addSelect('COUNT(*)', 'connectedMemberCount')
      .where('applicationAuthorization.workspaceId = :workspaceId', {
        workspaceId,
      })
      .andWhere('applicationAuthorization.revokedAt IS NULL')
      .groupBy('applicationAuthorization.applicationId')
      .getRawMany<{ applicationId: string; connectedMemberCount: string }>();

    return rows.map(({ applicationId, connectedMemberCount }) => ({
      applicationId,
      connectedMemberCount: Number(connectedMemberCount),
    }));
  }

  async isAccessTokenAuthorized(
    accessToken: Pick<
      ApplicationAccessTokenJwtPayload,
      'applicationAuthorizationId' | 'iat'
    >,
  ): Promise<boolean> {
    if (!isDefined(accessToken.applicationAuthorizationId)) {
      return true;
    }

    return isApplicationAccessTokenAuthorized({
      flatApplicationAuthorization: await this.coreEntityCacheService.get(
        'applicationAuthorization',
        accessToken.applicationAuthorizationId,
      ),
      token: accessToken,
    });
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
    // Every criterion matches at most one row: an id, or the unique (userId, applicationId) pair
    const { raw } = await this.applicationAuthorizationRepository
      .createQueryBuilder()
      .update()
      .set({ revokedAt: new Date() })
      .where({ ...criteria, revokedAt: IsNull() })
      .returning(['id'])
      .execute();

    const revokedAuthorizationId: unknown = raw[0]?.id;

    if (!isNonEmptyString(revokedAuthorizationId)) {
      return false;
    }

    // Access tokens are checked against the cached row, so they die here rather than at expiry
    await this.coreEntityCacheService.invalidate(
      'applicationAuthorization',
      revokedAuthorizationId,
    );

    return true;
  }

  private async findIdByUserAndApplicationOrThrow({
    userId,
    applicationId,
  }: {
    userId: string;
    applicationId: string;
  }): Promise<string> {
    const { id } = await this.applicationAuthorizationRepository.findOneOrFail({
      where: { userId, applicationId },
      select: { id: true },
    });

    return id;
  }
}
