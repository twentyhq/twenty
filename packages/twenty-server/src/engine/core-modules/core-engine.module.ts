import { Module } from '@nestjs/common';
import { APP_FILTER, HttpAdapterHost } from '@nestjs/core';
import { EventEmitterModule } from '@nestjs/event-emitter';

import { WorkspaceQueryRunnerModule } from 'src/engine/api/graphql/workspace-query-runner/workspace-query-runner.module';
import { ActorModule } from 'src/engine/core-modules/actor/actor.module';
import { ApplicationLogsModule } from 'src/engine/core-modules/application-logs/application-logs.module';
import { applicationLogsModuleFactory } from 'src/engine/core-modules/application-logs/application-logs.module-factory';
import { AdminPanelModule } from 'src/engine/core-modules/admin-panel/admin-panel.module';
import { ApiKeyModule } from 'src/engine/core-modules/api-key/api-key.module';
import { AppTokenModule } from 'src/engine/core-modules/app-token/app-token.module';
import { ApplicationDevelopmentModule } from 'src/engine/core-modules/application/application-development/application-development.module';
import { ApplicationInstallModule } from 'src/engine/core-modules/application/application-install/application-install.module';
import { MarketplaceModule } from 'src/engine/core-modules/application/application-marketplace/marketplace.module';
import { ApplicationOAuthModule } from 'src/engine/core-modules/application/application-oauth/application-oauth.module';
import { ApplicationRegistrationModule } from 'src/engine/core-modules/application/application-registration/application-registration.module';
import { ApplicationUpgradeModule } from 'src/engine/core-modules/application/application-upgrade/application-upgrade.module';
import { ApplicationModule } from 'src/engine/core-modules/application/application.module';
import { PreInstalledAppsModule } from 'src/engine/core-modules/application/pre-installed-apps/pre-installed-apps.module';
import { ApprovedAccessDomainModule } from 'src/engine/core-modules/approved-access-domain/approved-access-domain.module';
import { AuthModule } from 'src/engine/core-modules/auth/auth.module';
import { BillingWebhookModule } from 'src/engine/core-modules/billing-webhook/billing-webhook.module';
import { AppBillingModule } from 'src/engine/core-modules/billing/app-billing/app-billing.module';
import { BillingModule } from 'src/engine/core-modules/billing/billing.module';
import { BillingGraphqlApiExceptionFilter } from 'src/engine/core-modules/billing/filters/billing-graphql-api-exception.filter';
import { CacheStorageModule } from 'src/engine/core-modules/cache-storage/cache-storage.module';
import { TimelineCalendarEventModule } from 'src/engine/core-modules/calendar/timeline-calendar-event.module';
import { CaptchaModule } from 'src/engine/core-modules/captcha/captcha.module';
import { CloudflareModule } from 'src/engine/core-modules/cloudflare/cloudflare.module';
import { CodeInterpreterModule } from 'src/engine/core-modules/code-interpreter/code-interpreter.module';
import { DnsManagerModule } from 'src/engine/core-modules/dns-manager/dns-manager.module';
import { EmailModule } from 'src/engine/core-modules/email/email.module';
import { EmailingDomainModule } from 'src/engine/core-modules/emailing-domain/emailing-domain.module';
import { EnvironmentModule } from 'src/engine/core-modules/environment/environment.module';
import { ExceptionHandlerModule } from 'src/engine/core-modules/exception-handler/exception-handler.module';
import { exceptionHandlerModuleFactory } from 'src/engine/core-modules/exception-handler/exception-handler.module-factory';
import { FeatureFlagModule } from 'src/engine/core-modules/feature-flag/feature-flag.module';
import { FileStorageModule } from 'src/engine/core-modules/file-storage/file-storage.module';
import { GeoMapModule } from 'src/engine/core-modules/geo-map/geo-map-module';
import { HealthModule } from 'src/engine/core-modules/health/health.module';
import { ImapSmtpCaldavModule } from 'src/engine/core-modules/imap-smtp-caldav-connection/imap-smtp-caldav-connection.module';
import { ImpersonationModule } from 'src/engine/core-modules/impersonation/impersonation.module';
import { LabModule } from 'src/engine/core-modules/lab/lab.module';
import { LoggerModule } from 'src/engine/core-modules/logger/logger.module';
import { loggerModuleFactory } from 'src/engine/core-modules/logger/logger.module-factory';
import { LogicFunctionModule } from 'src/engine/core-modules/logic-function/logic-function.module';
import { MessageQueueModule } from 'src/engine/core-modules/message-queue/message-queue.module';
import { messageQueueModuleFactory } from 'src/engine/core-modules/message-queue/message-queue.module-factory';
import { TimelineMessagingModule } from 'src/engine/core-modules/messaging/timeline-messaging.module';
import { MetricsModule } from 'src/engine/core-modules/metrics/metrics.module';
import { MetricsService } from 'src/engine/core-modules/metrics/metrics.service';
import { OpenApiModule } from 'src/engine/core-modules/open-api/open-api.module';
import { PostgresCredentialsModule } from 'src/engine/core-modules/postgres-credentials/postgres-credentials.module';
import { PublicDomainModule } from 'src/engine/core-modules/public-domain/public-domain.module';
import { RedisClientModule } from 'src/engine/core-modules/redis-client/redis-client.module';
import { RedisClientService } from 'src/engine/core-modules/redis-client/redis-client.service';
import { SearchModule } from 'src/engine/core-modules/search/search.module';
import { WorkspaceSSOModule } from 'src/engine/core-modules/sso/sso.module';
import { TelemetryModule } from 'src/engine/core-modules/telemetry/telemetry.module';
import { TwentyConfigModule } from 'src/engine/core-modules/twenty-config/twenty-config.module';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { UsageModule } from 'src/engine/core-modules/usage/usage.module';
import { UserModule } from 'src/engine/core-modules/user/user.module';
import { WorkflowApiModule } from 'src/engine/core-modules/workflow/workflow-api.module';
import { WorkspaceInvitationModule } from 'src/engine/core-modules/workspace-invitation/workspace-invitation.module';
import { WorkspaceModule } from 'src/engine/core-modules/workspace/workspace.module';
import { AiBillingModule } from 'src/engine/metadata-modules/ai/ai-billing/ai-billing.module';
import { AiModelsModule } from 'src/engine/metadata-modules/ai/ai-models/ai-models.module';
import { PageLayoutModule } from 'src/engine/metadata-modules/page-layout/page-layout.module';
import { RoleModule } from 'src/engine/metadata-modules/role/role.module';
import { RowLevelPermissionModule } from 'src/engine/metadata-modules/row-level-permission-predicate/row-level-permission.module';
import { SubscriptionsModule } from 'src/engine/subscriptions/subscriptions.module';
import { TrashCleanupModule } from 'src/engine/trash-cleanup/trash-cleanup.module';
import { WorkspaceEventEmitterModule } from 'src/engine/workspace-event-emitter/workspace-event-emitter.module';
import { ChannelSyncModule } from 'src/modules/connected-account/channel-sync/channel-sync.module';
import { DashboardModule } from 'src/modules/dashboard/dashboard.module';
import { SendEmailModule } from 'src/modules/messaging/message-outbound-manager/send-email.module';
import { AuditModule } from './audit/audit.module';
import { ClientConfigModule } from './client-config/client-config.module';
import { EventLogsModule } from './event-logs/event-logs.module';
import { FileModule } from './file/file.module';

@Module({
  imports: [
    EnvironmentModule,
    TwentyConfigModule.forRoot(),
    HealthModule,
    AuditModule,
    AuthModule,
    BillingModule,
    BillingWebhookModule,
    UsageModule,
    ClientConfigModule,
    FeatureFlagModule,
    FileModule,
    RowLevelPermissionModule,
    OpenApiModule,
    ApplicationRegistrationModule,
    ApplicationOAuthModule,
    ApplicationModule,
    ApplicationInstallModule,
    ApplicationUpgradeModule,
    ApplicationDevelopmentModule,
    MarketplaceModule,
    AppTokenModule,
    TimelineMessagingModule,
    TimelineCalendarEventModule,
    UserModule,
    WorkspaceModule,
    WorkspaceInvitationModule,
    WorkspaceSSOModule,
    ApprovedAccessDomainModule,
    EmailingDomainModule,
    PublicDomainModule,
    CloudflareModule,
    DnsManagerModule,
    PostgresCredentialsModule,
    WorkflowApiModule,
    WorkspaceEventEmitterModule,
    ActorModule,
    TelemetryModule,
    AdminPanelModule,
    LabModule,
    RoleModule,
    RedisClientModule,
    WorkspaceQueryRunnerModule,
    GeoMapModule,
    SubscriptionsModule,
    ImapSmtpCaldavModule,
    ChannelSyncModule,
    SendEmailModule,
    FileStorageModule.forRoot(),
    LoggerModule.forRootAsync({
      useFactory: loggerModuleFactory,
      inject: [TwentyConfigService],
    }),
    MetricsModule,
    MessageQueueModule.registerAsync({
      useFactory: messageQueueModuleFactory,
      inject: [TwentyConfigService, RedisClientService, MetricsService],
    }),
    ExceptionHandlerModule.forRootAsync({
      useFactory: exceptionHandlerModuleFactory,
      inject: [TwentyConfigService, HttpAdapterHost],
    }),
    ApplicationLogsModule.forRootAsync({
      useFactory: applicationLogsModuleFactory,
      inject: [TwentyConfigService],
    }),
    EmailModule.forRoot(),
    CaptchaModule.forRoot(),
    EventEmitterModule.forRoot({
      wildcard: true,
    }),
    CacheStorageModule,
    AiModelsModule,
    AiBillingModule,
    LogicFunctionModule.forRoot(),
    CodeInterpreterModule.forRoot(),
    SearchModule,
    ApiKeyModule,
    PageLayoutModule,
    ImpersonationModule,
    TrashCleanupModule,
    DashboardModule,
    EventLogsModule,
    PreInstalledAppsModule,
    AppBillingModule,
  ],
  providers: [
    {
      provide: APP_FILTER,
      useClass: BillingGraphqlApiExceptionFilter,
    },
  ],
  exports: [
    AuditModule,
    AuthModule,
    FeatureFlagModule,
    TimelineMessagingModule,
    TimelineCalendarEventModule,
    UserModule,
    WorkspaceModule,
    WorkspaceInvitationModule,
    WorkspaceSSOModule,
    ImapSmtpCaldavModule,
  ],
})
export class CoreEngineModule {}
