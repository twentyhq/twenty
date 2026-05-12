import { Module } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AdminPanelApplicationRegistrationResolver } from 'src/engine/core-modules/admin-panel/admin-panel-application-registration.resolver';
import { AdminPanelHealthService } from 'src/engine/core-modules/admin-panel/admin-panel-health.service';
import { AdminPanelQueueService } from 'src/engine/core-modules/admin-panel/admin-panel-queue.service';
import { AdminPanelResolver } from 'src/engine/core-modules/admin-panel/admin-panel.resolver';
import { AppHealthIndicator } from 'src/engine/core-modules/admin-panel/indicators/app.health';
import { ConnectedAccountHealth } from 'src/engine/core-modules/admin-panel/indicators/connected-account.health';
import { DatabaseHealthIndicator } from 'src/engine/core-modules/admin-panel/indicators/database.health';
import { RedisHealthIndicator } from 'src/engine/core-modules/admin-panel/indicators/redis.health';
import { WorkerHealthIndicator } from 'src/engine/core-modules/admin-panel/indicators/worker.health';
import { MaintenanceModeService } from 'src/engine/core-modules/admin-panel/maintenance-mode.service';
import { AdminPanelBillingService } from 'src/engine/core-modules/admin-panel/services/admin-panel-billing.service';
import { AdminPanelChatService } from 'src/engine/core-modules/admin-panel/services/admin-panel-chat.service';
import { AdminPanelConfigService } from 'src/engine/core-modules/admin-panel/services/admin-panel-config.service';
import { AdminPanelStatisticsService } from 'src/engine/core-modules/admin-panel/services/admin-panel-statistics.service';
import { AdminPanelUserLookupService } from 'src/engine/core-modules/admin-panel/services/admin-panel-user-lookup.service';
import { AdminPanelVersionService } from 'src/engine/core-modules/admin-panel/services/admin-panel-version.service';
import { ApplicationRegistrationModule } from 'src/engine/core-modules/application/application-registration/application-registration.module';
import { AuditModule } from 'src/engine/core-modules/audit/audit.module';
import { AuthModule } from 'src/engine/core-modules/auth/auth.module';
import { BillingModule } from 'src/engine/core-modules/billing/billing.module';
import { BillingCustomerEntity } from 'src/engine/core-modules/billing/entities/billing-customer.entity';
import { BillingPriceEntity } from 'src/engine/core-modules/billing/entities/billing-price.entity';
import { WorkspaceDomainsModule } from 'src/engine/core-modules/domain/workspace-domains/workspace-domains.module';
import { FeatureFlagEntity } from 'src/engine/core-modules/feature-flag/feature-flag.entity';
import { FeatureFlagModule } from 'src/engine/core-modules/feature-flag/feature-flag.module';
import { FileModule } from 'src/engine/core-modules/file/file.module';
import { ImpersonationModule } from 'src/engine/core-modules/impersonation/impersonation.module';
import { KeyValuePairModule } from 'src/engine/core-modules/key-value-pair/key-value-pair.module';
import { MetricsModule } from 'src/engine/core-modules/metrics/metrics.module';
import { RedisClientModule } from 'src/engine/core-modules/redis-client/redis-client.module';
import { SecureHttpClientModule } from 'src/engine/core-modules/secure-http-client/secure-http-client.module';
import { TelemetryModule } from 'src/engine/core-modules/telemetry/telemetry.module';
import { UpgradeModule } from 'src/engine/core-modules/upgrade/upgrade.module';
import { UsageModule } from 'src/engine/core-modules/usage/usage.module';
import { UserWorkspaceEntity } from 'src/engine/core-modules/user-workspace/user-workspace.entity';
import { UserVarsModule } from 'src/engine/core-modules/user/user-vars/user-vars.module';
import { UserEntity } from 'src/engine/core-modules/user/user.entity';
import { UserModule } from 'src/engine/core-modules/user/user.module';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { AgentMessageEntity } from 'src/engine/metadata-modules/ai/ai-agent-execution/entities/agent-message.entity';
import { AgentChatThreadEntity } from 'src/engine/metadata-modules/ai/ai-chat/entities/agent-chat-thread.entity';
import { PermissionsModule } from 'src/engine/metadata-modules/permissions/permissions.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      UserEntity,
      WorkspaceEntity,
      UserWorkspaceEntity,
      FeatureFlagEntity,
      AgentChatThreadEntity,
      AgentMessageEntity,
      BillingCustomerEntity,
      BillingPriceEntity,
    ]),
    AuthModule,
    BillingModule,
    FileModule,
    WorkspaceDomainsModule,
    RedisClientModule,
    TerminusModule,
    MetricsModule,
    FeatureFlagModule,
    AuditModule,
    TelemetryModule,
    ImpersonationModule,
    PermissionsModule,
    SecureHttpClientModule,
    ApplicationRegistrationModule,
    UsageModule,
    KeyValuePairModule,
    UserVarsModule,
    UpgradeModule,
    UserModule,
  ],
  providers: [
    AdminPanelResolver,
    AdminPanelApplicationRegistrationResolver,
    AdminPanelUserLookupService,
    AdminPanelStatisticsService,
    AdminPanelBillingService,
    AdminPanelChatService,
    AdminPanelConfigService,
    AdminPanelVersionService,
    AdminPanelHealthService,
    AdminPanelQueueService,
    MaintenanceModeService,
    DatabaseHealthIndicator,
    RedisHealthIndicator,
    WorkerHealthIndicator,
    ConnectedAccountHealth,
    AppHealthIndicator,
  ],
  exports: [
    AdminPanelUserLookupService,
    AdminPanelStatisticsService,
    AdminPanelChatService,
    AdminPanelConfigService,
    AdminPanelVersionService,
    MaintenanceModeService,
  ],
})
export class AdminPanelModule {}
