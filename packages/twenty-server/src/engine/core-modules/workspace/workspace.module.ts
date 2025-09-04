import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { NestjsQueryGraphQLModule } from '@ptc-org/nestjs-query-graphql';
import { NestjsQueryTypeOrmModule } from '@ptc-org/nestjs-query-typeorm';

import { TypeORMModule } from 'src/database/typeorm/typeorm.module';
import { TokenModule } from 'src/engine/core-modules/auth/token/token.module';
import { BillingModule } from 'src/engine/core-modules/billing/billing.module';
import { BillingSubscription } from 'src/engine/core-modules/billing/entities/billing-subscription.entity';
import { FeatureFlagModule } from 'src/engine/core-modules/feature-flag/feature-flag.module';
import { FileUploadModule } from 'src/engine/core-modules/file/file-upload/file-upload.module';
import { FileModule } from 'src/engine/core-modules/file/file.module';
import { OnboardingModule } from 'src/engine/core-modules/onboarding/onboarding.module';
import { UserWorkspace } from 'src/engine/core-modules/user-workspace/user-workspace.entity';
import { UserWorkspaceModule } from 'src/engine/core-modules/user-workspace/user-workspace.module';
import { User } from 'src/engine/core-modules/user/user.entity';
import { CoreViewModule } from 'src/engine/core-modules/view/view.module';
import { WorkspaceWorkspaceMemberListener } from 'src/engine/core-modules/workspace/workspace-workspace-member.listener';
import { WorkspaceResolver } from 'src/engine/core-modules/workspace/workspace.resolver';
import { AgentModule } from 'src/engine/metadata-modules/agent/agent.module';
import { DataSourceModule } from 'src/engine/metadata-modules/data-source/data-source.module';
import { PermissionsModule } from 'src/engine/metadata-modules/permissions/permissions.module';
import { RoleModule } from 'src/engine/metadata-modules/role/role.module';
import { WorkspaceMetadataCacheModule } from 'src/engine/metadata-modules/workspace-metadata-cache/workspace-metadata-cache.module';
import { WorkspaceCacheStorageModule } from 'src/engine/workspace-cache-storage/workspace-cache-storage.module';
import { WorkspaceManagerModule } from 'src/engine/workspace-manager/workspace-manager.module';
import { DnsManagerModule } from 'src/engine/core-modules/dns-manager/dns-manager.module';
import { DomainManagerModule } from 'src/engine/core-modules/domain-manager/domain-manager.module';
import { CheckCustomDomainValidRecordsCronJob } from 'src/engine/core-modules/workspace/crons/jobs/check-custom-domain-valid-records.cron.job';
import { CheckCustomDomainValidRecordsCronCommand } from 'src/engine/core-modules/workspace/crons/commands/check-custom-domain-valid-records.cron.command';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { workspaceAutoResolverOpts } from 'src/engine/core-modules/workspace/workspace.auto-resolver-opts';
import { WorkspaceService } from 'src/engine/core-modules/workspace/services/workspace.service';
import { AuditModule } from 'src/engine/core-modules/audit/audit.module';
import { PublicDomain } from 'src/engine/core-modules/public-domain/public-domain.entity';

@Module({
  imports: [
    TypeORMModule,
    TypeOrmModule.forFeature([BillingSubscription]),
    NestjsQueryGraphQLModule.forFeature({
      imports: [
        AuditModule,
        BillingModule,
        FileModule,
        TokenModule,
        FileUploadModule,
        WorkspaceMetadataCacheModule,
        NestjsQueryTypeOrmModule.forFeature([
          User,
          Workspace,
          UserWorkspace,
          PublicDomain,
        ]),
        UserWorkspaceModule,
        WorkspaceManagerModule,
        FeatureFlagModule,
        DataSourceModule,
        OnboardingModule,
        TypeORMModule,
        PermissionsModule,
        WorkspaceCacheStorageModule,
        RoleModule,
        AgentModule,
        DnsManagerModule,
        DomainManagerModule,
        CoreViewModule,
      ],
      services: [WorkspaceService],
      resolvers: workspaceAutoResolverOpts,
    }),
  ],
  exports: [WorkspaceService, CheckCustomDomainValidRecordsCronCommand],
  providers: [
    WorkspaceResolver,
    WorkspaceService,
    WorkspaceWorkspaceMemberListener,
    CheckCustomDomainValidRecordsCronCommand,
    CheckCustomDomainValidRecordsCronJob,
  ],
})
export class WorkspaceModule {}
