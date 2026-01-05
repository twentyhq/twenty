import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { NestjsQueryGraphQLModule } from '@ptc-org/nestjs-query-graphql';
import { NestjsQueryTypeOrmModule } from '@ptc-org/nestjs-query-typeorm';

import { TypeORMModule } from 'src/database/typeorm/typeorm.module';
import { ApplicationModule } from 'src/engine/core-modules/application/application.module';
import { AuditModule } from 'src/engine/core-modules/audit/audit.module';
import { TokenModule } from 'src/engine/core-modules/auth/token/token.module';
import { BillingModule } from 'src/engine/core-modules/billing/billing.module';
import { BillingSubscriptionEntity } from 'src/engine/core-modules/billing/entities/billing-subscription.entity';
import { DnsManagerModule } from 'src/engine/core-modules/dns-manager/dns-manager.module';
import { CustomDomainManagerModule } from 'src/engine/core-modules/domain/custom-domain-manager/custom-domain-manager.module';
import { SubdomainManagerModule } from 'src/engine/core-modules/domain/subdomain-manager/subdomain-manager.module';
import { WorkspaceDomainsModule } from 'src/engine/core-modules/domain/workspace-domains/workspace-domains.module';
import { FeatureFlagModule } from 'src/engine/core-modules/feature-flag/feature-flag.module';
import { FileUploadModule } from 'src/engine/core-modules/file/file-upload/file-upload.module';
import { FileModule } from 'src/engine/core-modules/file/file.module';
import { OnboardingModule } from 'src/engine/core-modules/onboarding/onboarding.module';
import { PublicDomainEntity } from 'src/engine/core-modules/public-domain/public-domain.entity';
import { UserWorkspaceEntity } from 'src/engine/core-modules/user-workspace/user-workspace.entity';
import { UserWorkspaceModule } from 'src/engine/core-modules/user-workspace/user-workspace.module';
import { UserEntity } from 'src/engine/core-modules/user/user.entity';
import { CheckCustomDomainValidRecordsCronCommand } from 'src/engine/core-modules/workspace/crons/commands/check-custom-domain-valid-records.cron.command';
import { CheckCustomDomainValidRecordsCronJob } from 'src/engine/core-modules/workspace/crons/jobs/check-custom-domain-valid-records.cron.job';
import { WorkspaceService } from 'src/engine/core-modules/workspace/services/workspace.service';
import { workspaceAutoResolverOpts } from 'src/engine/core-modules/workspace/workspace.auto-resolver-opts';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { WorkspaceResolver } from 'src/engine/core-modules/workspace/workspace.resolver';
import { AiAgentModule } from 'src/engine/metadata-modules/ai/ai-agent/ai-agent.module';
import { DataSourceModule } from 'src/engine/metadata-modules/data-source/data-source.module';
import { WorkspaceManyOrAllFlatEntityMapsCacheModule } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.module';
import { PermissionsModule } from 'src/engine/metadata-modules/permissions/permissions.module';
import { RoleModule } from 'src/engine/metadata-modules/role/role.module';
import { ViewModule } from 'src/engine/metadata-modules/view/view.module';
import { WorkspaceCacheStorageModule } from 'src/engine/workspace-cache-storage/workspace-cache-storage.module';
import { WorkspaceDataSourceModule } from 'src/engine/workspace-datasource/workspace-datasource.module';
import { WorkspaceManagerModule } from 'src/engine/workspace-manager/workspace-manager.module';

@Module({
  imports: [
    TypeORMModule,
    TypeOrmModule.forFeature([BillingSubscriptionEntity]),
    NestjsQueryGraphQLModule.forFeature({
      imports: [
        AuditModule,
        BillingModule,
        FileModule,
        TokenModule,
        FileUploadModule,
        NestjsQueryTypeOrmModule.forFeature([
          UserEntity,
          WorkspaceEntity,
          UserWorkspaceEntity,
          PublicDomainEntity,
        ]),
        UserWorkspaceModule,
        WorkspaceManagerModule,
        FeatureFlagModule,
        DataSourceModule,
        OnboardingModule,
        WorkspaceDataSourceModule,
        TypeORMModule,
        PermissionsModule,
        WorkspaceCacheStorageModule,
        RoleModule,
        AiAgentModule,
        DnsManagerModule,
        WorkspaceDomainsModule,
        SubdomainManagerModule,
        CustomDomainManagerModule,
        ViewModule,
        WorkspaceManyOrAllFlatEntityMapsCacheModule,
        ApplicationModule,
      ],
      services: [WorkspaceService],
      resolvers: workspaceAutoResolverOpts,
    }),
  ],
  exports: [WorkspaceService, CheckCustomDomainValidRecordsCronCommand],
  providers: [
    WorkspaceResolver,
    WorkspaceService,
    CheckCustomDomainValidRecordsCronCommand,
    CheckCustomDomainValidRecordsCronJob,
  ],
})
export class WorkspaceModule {}
