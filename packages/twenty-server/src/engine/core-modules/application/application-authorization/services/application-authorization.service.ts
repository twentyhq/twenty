import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { isDefined } from 'twenty-shared/utils';
import { IsNull, Repository } from 'typeorm';

import { CoreEntityCacheService } from 'src/engine/core-entity-cache/services/core-entity-cache.service';
import { ApplicationAuthorizationEntity } from 'src/engine/core-modules/application/application-authorization/application-authorization.entity';
import { type ApplicationAuthorizationDTO } from 'src/engine/core-modules/application/application-authorization/dtos/application-authorization.dto';
import { toApplicationAuthorizationDTO } from 'src/engine/core-modules/application/application-authorization/utils/to-application-authorization-dto.util';
import { MARKETPLACE_CATALOG_CACHE_ENTITY_ID } from 'src/engine/core-modules/application/application-marketplace/constants/marketplace-apps-cache.constant';

@Injectable()
export class ApplicationAuthorizationService {
  private readonly logger = new Logger(ApplicationAuthorizationService.name);

  constructor(
    @InjectRepository(ApplicationAuthorizationEntity)
    private readonly applicationAuthorizationRepository: Repository<ApplicationAuthorizationEntity>,
    private readonly coreEntityCacheService: CoreEntityCacheService,
  ) {}

  async toApplicationAuthorizationDTOs(
    authorizations: ApplicationAuthorizationEntity[],
  ): Promise<ApplicationAuthorizationDTO[]> {
    const marketplaceAppUniversalIdentifiersByClientIdMetadataDocumentUrl =
      await this.findMarketplaceAppUniversalIdentifiersByClientIdMetadataDocumentUrl();

    return authorizations.map((authorization) =>
      toApplicationAuthorizationDTO({
        authorization,
        marketplaceAppUniversalIdentifiersByClientIdMetadataDocumentUrl,
      }),
    );
  }

  private async findMarketplaceAppUniversalIdentifiersByClientIdMetadataDocumentUrl(): Promise<
    Record<string, string>
  > {
    try {
      const marketplaceCatalog =
        (await this.coreEntityCacheService.get(
          'marketplaceCatalog',
          MARKETPLACE_CATALOG_CACHE_ENTITY_ID,
        )) ?? {};

      return Object.fromEntries(
        Object.values(marketplaceCatalog).flatMap((marketplaceApp) =>
          (marketplaceApp.attributedClientIdMetadataDocumentUrls ?? []).map(
            (url) => [url, marketplaceApp.id],
          ),
        ),
      );
    } catch (error) {
      this.logger.error(
        'Failed to read the marketplace catalog, listing connections without their marketplace application',
        error,
      );

      return {};
    }
  }

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

    // Authorizing on top of an active authorization keeps its start, so the member's other sessions keep refreshing
    const { affected } = await this.applicationAuthorizationRepository.update(
      { userId, applicationId, revokedAt: IsNull() },
      { workspaceId, userWorkspaceId, scopes, lastUsedAt: now },
    );

    if (isDefined(affected) && affected > 0) {
      return;
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

  async findActiveAuthorizationsForWorkspace({
    workspaceId,
  }: {
    workspaceId: string;
  }): Promise<ApplicationAuthorizationEntity[]> {
    return await this.applicationAuthorizationRepository
      .createQueryBuilder('applicationAuthorization')
      .innerJoinAndSelect('applicationAuthorization.application', 'application')
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
