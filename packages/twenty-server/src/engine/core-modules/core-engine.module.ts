import { Module } from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';
import { EventEmitterModule } from '@nestjs/event-emitter';

import { ActorModule } from 'src/engine/core-modules/actor/actor.module';
import { AdminPanelModule } from 'src/engine/core-modules/admin-panel/admin-panel.module';
import { AppTokenModule } from 'src/engine/core-modules/app-token/app-token.module';
import { ApprovedAccessDomainModule } from 'src/engine/core-modules/approved-access-domain/approved-access-domain.module';
import { AuthModule } from 'src/engine/core-modules/auth/auth.module';
import { BillingModule } from 'src/engine/core-modules/billing/billing.module';
import { CacheStorageModule } from 'src/engine/core-modules/cache-storage/cache-storage.module';
import { TimelineCalendarEventModule } from 'src/engine/core-modules/calendar/timeline-calendar-event.module';
import { CaptchaModule } from 'src/engine/core-modules/captcha/captcha.module';
import { captchaModuleFactory } from 'src/engine/core-modules/captcha/captcha.module-factory';
import { EmailModule } from 'src/engine/core-modules/email/email.module';
import { emailModuleFactory } from 'src/engine/core-modules/email/email.module-factory';
import { ExceptionHandlerModule } from 'src/engine/core-modules/exception-handler/exception-handler.module';
import { exceptionHandlerModuleFactory } from 'src/engine/core-modules/exception-handler/exception-handler.module-factory';
import { FeatureFlagModule } from 'src/engine/core-modules/feature-flag/feature-flag.module';
import { FileStorageModule } from 'src/engine/core-modules/file-storage/file-storage.module';
import { fileStorageModuleFactory } from 'src/engine/core-modules/file-storage/file-storage.module-factory';
import { FileStorageService } from 'src/engine/core-modules/file-storage/file-storage.service';
import { HealthModule } from 'src/engine/core-modules/health/health.module';
import { LabModule } from 'src/engine/core-modules/lab/lab.module';
import { LLMChatModelModule } from 'src/engine/core-modules/llm-chat-model/llm-chat-model.module';
import { llmChatModelModuleFactory } from 'src/engine/core-modules/llm-chat-model/llm-chat-model.module-factory';
import { LLMTracingModule } from 'src/engine/core-modules/llm-tracing/llm-tracing.module';
import { llmTracingModuleFactory } from 'src/engine/core-modules/llm-tracing/llm-tracing.module-factory';
import { LoggerModule } from 'src/engine/core-modules/logger/logger.module';
import { loggerModuleFactory } from 'src/engine/core-modules/logger/logger.module-factory';
import { MessageQueueModule } from 'src/engine/core-modules/message-queue/message-queue.module';
import { messageQueueModuleFactory } from 'src/engine/core-modules/message-queue/message-queue.module-factory';
import { TimelineMessagingModule } from 'src/engine/core-modules/messaging/timeline-messaging.module';
import { OpenApiModule } from 'src/engine/core-modules/open-api/open-api.module';
import { PostgresCredentialsModule } from 'src/engine/core-modules/postgres-credentials/postgres-credentials.module';
import { RedisClientModule } from 'src/engine/core-modules/redis-client/redis-client.module';
import { RedisClientService } from 'src/engine/core-modules/redis-client/redis-client.service';
import { SearchModule } from 'src/engine/core-modules/search/search.module';
import { serverlessModuleFactory } from 'src/engine/core-modules/serverless/serverless-module.factory';
import { ServerlessModule } from 'src/engine/core-modules/serverless/serverless.module';
import { WorkspaceSSOModule } from 'src/engine/core-modules/sso/sso.module';
import { TelemetryModule } from 'src/engine/core-modules/telemetry/telemetry.module';
import { TwentyConfigModule } from 'src/engine/core-modules/twenty-config/twenty-config.module';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { UserModule } from 'src/engine/core-modules/user/user.module';
import { WorkflowApiModule } from 'src/engine/core-modules/workflow/workflow-api.module';
import { WorkspaceInvitationModule } from 'src/engine/core-modules/workspace-invitation/workspace-invitation.module';
import { WorkspaceModule } from 'src/engine/core-modules/workspace/workspace.module';
import { RoleModule } from 'src/engine/metadata-modules/role/role.module';
import { WorkspaceEventEmitterModule } from 'src/engine/workspace-event-emitter/workspace-event-emitter.module';
import { WorkspaceQueryRunnerModule } from 'src/engine/api/graphql/workspace-query-runner/workspace-query-runner.module';
import { SubscriptionsModule } from 'src/engine/subscriptions/subscriptions.module';

import { AnalyticsModule } from './analytics/analytics.module';
import { ClientConfigModule } from './client-config/client-config.module';
import { FileModule } from './file/file.module';

@Module({
  imports: [
    HealthModule,
    AnalyticsModule,
    AuthModule,
    BillingModule,
    ClientConfigModule,
    FeatureFlagModule,
    FileModule,
    OpenApiModule,
    AppTokenModule,
    TimelineMessagingModule,
    TimelineCalendarEventModule,
    UserModule,
    WorkspaceModule,
    WorkspaceInvitationModule,
    WorkspaceSSOModule,
    ApprovedAccessDomainModule,
    PostgresCredentialsModule,
    WorkflowApiModule,
    WorkspaceEventEmitterModule,
    ActorModule,
    TelemetryModule,
    AdminPanelModule,
    LabModule,
    RoleModule,
    TwentyConfigModule,
    RedisClientModule,
    WorkspaceQueryRunnerModule,
    SubscriptionsModule,
    FileStorageModule.forRootAsync({
      useFactory: fileStorageModuleFactory,
      inject: [TwentyConfigService],
    }),
    LoggerModule.forRootAsync({
      useFactory: loggerModuleFactory,
      inject: [TwentyConfigService],
    }),
    MessageQueueModule.registerAsync({
      useFactory: messageQueueModuleFactory,
      inject: [TwentyConfigService, RedisClientService],
    }),
    ExceptionHandlerModule.forRootAsync({
      useFactory: exceptionHandlerModuleFactory,
      inject: [TwentyConfigService, HttpAdapterHost],
    }),
    EmailModule.forRoot({
      useFactory: emailModuleFactory,
      inject: [TwentyConfigService],
    }),
    CaptchaModule.forRoot({
      useFactory: captchaModuleFactory,
      inject: [TwentyConfigService],
    }),
    EventEmitterModule.forRoot({
      wildcard: true,
    }),
    CacheStorageModule,
    LLMChatModelModule.forRoot({
      useFactory: llmChatModelModuleFactory,
      inject: [TwentyConfigService],
    }),
    LLMTracingModule.forRoot({
      useFactory: llmTracingModuleFactory,
      inject: [TwentyConfigService],
    }),
    ServerlessModule.forRootAsync({
      useFactory: serverlessModuleFactory,
      inject: [TwentyConfigService, FileStorageService],
    }),
    SearchModule,
  ],
  exports: [
    AnalyticsModule,
    AuthModule,
    FeatureFlagModule,
    TimelineMessagingModule,
    TimelineCalendarEventModule,
    UserModule,
    WorkspaceModule,
    WorkspaceInvitationModule,
    WorkspaceSSOModule,
  ],
})
export class CoreEngineModule {}
