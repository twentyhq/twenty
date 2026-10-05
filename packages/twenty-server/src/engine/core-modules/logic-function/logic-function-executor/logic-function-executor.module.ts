import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ApplicationRegistrationVariableModule } from 'src/engine/core-modules/application/application-registration-variable/application-registration-variable.module';
import { ApplicationVariableEntityModule } from 'src/engine/core-modules/application/application-variable/application-variable.module';
import { ApplicationModule } from 'src/engine/core-modules/application/application.module';
import { EventLogEmitterModule } from 'src/engine/core-modules/event-logs/emit/event-log-emitter.module';
import { EventLogLiveModule } from 'src/engine/core-modules/event-logs/live/event-log-live.module';
import { TokenModule } from 'src/engine/core-modules/auth/token/token.module';
import { BillingModule } from 'src/engine/core-modules/billing/billing.module';
import { WorkspaceDomainsModule } from 'src/engine/core-modules/domain/workspace-domains/workspace-domains.module';
import { FeatureFlagModule } from 'src/engine/core-modules/feature-flag/feature-flag.module';
import { LogicFunctionExecutorService } from 'src/engine/core-modules/logic-function/logic-function-executor/logic-function-executor.service';
import { ThrottlerModule } from 'src/engine/core-modules/throttler/throttler.module';
import { UsageLimitModule } from 'src/engine/core-modules/usage-limit/usage-limit.module';
import { UsageModule } from 'src/engine/core-modules/usage/usage.module';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { SubscriptionsModule } from 'src/engine/subscriptions/subscriptions.module';
import { LogicFunctionPrebuiltWarmUpModule } from 'src/engine/core-modules/logic-function/logic-function-prebuilt-warm-up/logic-function-prebuilt-warm-up.module';
import { WorkspaceCacheModule } from 'src/engine/workspace-cache/workspace-cache.module';

@Module({
  imports: [
    ThrottlerModule,
    EventLogEmitterModule,
    EventLogLiveModule,
    TokenModule,
    SubscriptionsModule,
    WorkspaceCacheModule,
    LogicFunctionPrebuiltWarmUpModule,
    BillingModule,
    FeatureFlagModule,
    WorkspaceDomainsModule,
    ApplicationModule,
    ApplicationRegistrationVariableModule,
    ApplicationVariableEntityModule,
    UsageLimitModule,
    UsageModule,
    TypeOrmModule.forFeature([WorkspaceEntity]),
  ],
  providers: [LogicFunctionExecutorService],
  exports: [LogicFunctionExecutorService],
})
export class LogicFunctionExecutorModule {}
