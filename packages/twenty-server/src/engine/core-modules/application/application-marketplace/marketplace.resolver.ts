import { UseFilters, UseGuards, UseInterceptors } from '@nestjs/common';
import { Args, Mutation, Query } from '@nestjs/graphql';

import { PermissionFlagType } from 'twenty-shared/constants';
import { isDefined, isNonEmptyArray } from 'twenty-shared/utils';

import { MARKETPLACE_BUILT_IN_APPLICATIONS } from 'src/engine/core-modules/application/application-marketplace/constants/marketplace-built-in-applications.constant';
import { findMarketplaceBuiltInApplication } from 'src/engine/core-modules/application/application-marketplace/utils/find-marketplace-built-in-application.util';
import { toMarketplaceBuiltInAppDetailDTO } from 'src/engine/core-modules/application/application-marketplace/utils/to-marketplace-built-in-app-detail-dto.util';
import { toMarketplaceBuiltInAppDTO } from 'src/engine/core-modules/application/application-marketplace/utils/to-marketplace-built-in-app-dto.util';
import { DomainServerConfigService } from 'src/engine/core-modules/domain/domain-server-config/services/domain-server-config.service';
import { MetadataResolver } from 'src/engine/api/graphql/graphql-config/decorators/metadata-resolver.decorator';
import { ApplicationRegistrationExceptionFilter } from 'src/engine/core-modules/application/application-registration/application-registration-exception-filter';
import { MarketplaceAppDTO } from 'src/engine/core-modules/application/application-marketplace/dtos/marketplace-app.dto';
import { MarketplaceAppDetailDTO } from 'src/engine/core-modules/application/application-marketplace/dtos/marketplace-app-detail.dto';
import { MarketplaceQueryService } from 'src/engine/core-modules/application/application-marketplace/marketplace-query.service';
import { WorkspaceMigrationGraphqlApiExceptionInterceptor } from 'src/engine/workspace-manager/workspace-migration/interceptors/workspace-migration-graphql-api-exception.interceptor';
import { MarketplaceCatalogSyncCronJob } from 'src/engine/core-modules/application/application-marketplace/crons/marketplace-catalog-sync.cron.job';
import { InjectMessageQueue } from 'src/engine/core-modules/message-queue/decorators/message-queue.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { MessageQueueService } from 'src/engine/core-modules/message-queue/services/message-queue.service';
import { AuthGraphqlApiExceptionFilter } from 'src/engine/core-modules/auth/filters/auth-graphql-api-exception.filter';
import { AccessPolicyGuard } from 'src/engine/guards/access-policy.guard';
import { type AccessPolicy } from 'src/engine/guards/types/access-policy.type';

const MARKETPLACE_READ_ACCESS_POLICY: AccessPolicy = {
  authPrincipals: {
    userSession: {
      standard: true,
      impersonated: true,
      playground: true,
      workspaceAgnostic: false,
    },
    apiKey: true,
    oauthClient: true,
    application: true,
  },
  requiredPermissionFlags: [],
};

@MetadataResolver()
@UseFilters(
  ApplicationRegistrationExceptionFilter,
  AuthGraphqlApiExceptionFilter,
)
@UseInterceptors(WorkspaceMigrationGraphqlApiExceptionInterceptor)
export class MarketplaceResolver {
  constructor(
    private readonly marketplaceQueryService: MarketplaceQueryService,
    private readonly domainServerConfigService: DomainServerConfigService,
    @InjectMessageQueue(MessageQueue.cronQueue)
    private readonly messageQueueService: MessageQueueService,
  ) {}

  @Query(() => [MarketplaceAppDTO])
  @UseGuards(AccessPolicyGuard(MARKETPLACE_READ_ACCESS_POLICY))
  async findManyMarketplaceApps(
    @Args({
      name: 'universalIdentifiers',
      type: () => [String],
      nullable: true,
    })
    universalIdentifiers?: string[],
  ): Promise<MarketplaceAppDTO[]> {
    const frontBaseUrl = this.domainServerConfigService.getBaseUrl();
    const builtInApps = MARKETPLACE_BUILT_IN_APPLICATIONS.filter(
      ({ universalIdentifier }) =>
        !isNonEmptyArray(universalIdentifiers) ||
        universalIdentifiers.includes(universalIdentifier),
    ).map((builtInApplication) =>
      toMarketplaceBuiltInAppDTO({ builtInApplication, frontBaseUrl }),
    );

    const catalogApps =
      await this.marketplaceQueryService.findManyMarketplaceApps({
        universalIdentifiers,
      });

    return [...builtInApps, ...catalogApps];
  }

  @Query(() => MarketplaceAppDetailDTO)
  @UseGuards(AccessPolicyGuard(MARKETPLACE_READ_ACCESS_POLICY))
  async findMarketplaceAppDetail(
    @Args('universalIdentifier') universalIdentifier: string,
  ): Promise<MarketplaceAppDetailDTO> {
    const builtInApplication =
      findMarketplaceBuiltInApplication(universalIdentifier);

    if (isDefined(builtInApplication)) {
      return toMarketplaceBuiltInAppDetailDTO({
        builtInApplication,
        frontBaseUrl: this.domainServerConfigService.getBaseUrl(),
      });
    }

    return this.marketplaceQueryService.findMarketplaceAppDetail(
      universalIdentifier,
    );
  }

  @Mutation(() => Boolean)
  @UseGuards(
    AccessPolicyGuard({
      authPrincipals: {
        userSession: {
          standard: true,
          impersonated: true,
          playground: true,
          workspaceAgnostic: false,
        },
        apiKey: true,
        oauthClient: true,
        application: false,
      },
      requiredPermissionFlags: [PermissionFlagType.MARKETPLACE_APPS],
    }),
  )
  async syncMarketplaceCatalog(): Promise<boolean> {
    await this.messageQueueService.add(
      MarketplaceCatalogSyncCronJob.name,
      {},
      { id: 'marketplace-catalog-sync', isSystemJob: true }, // Avoids triggering multiple pending jobs
    );

    return true;
  }
}
