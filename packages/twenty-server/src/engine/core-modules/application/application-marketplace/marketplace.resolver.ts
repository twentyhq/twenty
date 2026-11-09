import { UseFilters, UseGuards, UseInterceptors } from '@nestjs/common';
import { Args, Mutation, Query } from '@nestjs/graphql';

import { PermissionFlagType } from 'twenty-shared/constants';
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
    return this.marketplaceQueryService.findManyMarketplaceApps({
      universalIdentifiers,
    });
  }

  @Query(() => MarketplaceAppDetailDTO)
  @UseGuards(AccessPolicyGuard(MARKETPLACE_READ_ACCESS_POLICY))
  async findMarketplaceAppDetail(
    @Args('universalIdentifier') universalIdentifier: string,
  ): Promise<MarketplaceAppDetailDTO> {
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
