import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { CoreEntityCacheModule } from 'src/engine/core-entity-cache/core-entity-cache.module';
import { ApplicationRegistrationVariableModule } from 'src/engine/core-modules/application/application-registration-variable/application-registration-variable.module';
import { ApplicationVariableEntityModule } from 'src/engine/core-modules/application/application-variable/application-variable.module';
import { ApplicationModule } from 'src/engine/core-modules/application/application.module';
import { EventLogEmitterModule } from 'src/engine/core-modules/event-logs/emit/event-log-emitter.module';
import { EventLogLiveModule } from 'src/engine/core-modules/event-logs/live/event-log-live.module';
import { TokenModule } from 'src/engine/core-modules/auth/token/token.module';
import { BillingModule } from 'src/engine/core-modules/billing/billing.module';
import { WorkspaceDomainsModule } from 'src/engine/core-modules/domain/workspace-domains/workspace-domains.module';
import { LogicFunctionExecutionThrottleModule } from 'src/engine/core-modules/logic-function/logic-function-execution-throttle/logic-function-execution-throttle.module';
import { LogicFunctionExecutorService } from 'src/engine/core-modules/logic-function/logic-function-executor/logic-function-executor.service';
import { UsageLimitModule } from 'src/engine/core-modules/usage-limit/usage-limit.module';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { LogicFunctionPrebuiltInstallModule } from 'src/engine/core-modules/logic-function/logic-function-prebuilt-install/logic-function-prebuilt-install.module';
import { WorkspaceCacheModule } from 'src/engine/workspace-cache/workspace-cache.module';

@Module({
  imports: [
    LogicFunctionExecutionThrottleModule,
    EventLogEmitterModule,
    EventLogLiveModule,
    TokenModule,
    WorkspaceCacheModule,
    LogicFunctionPrebuiltInstallModule,
    BillingModule,
    WorkspaceDomainsModule,
    ApplicationModule,
    ApplicationRegistrationVariableModule,
    ApplicationVariableEntityModule,
    UsageLimitModule,
    CoreEntityCacheModule,
    TypeOrmModule.forFeature([WorkspaceEntity]),
  ],
  providers: [LogicFunctionExecutorService],
  exports: [LogicFunctionExecutorService],
})
export class LogicFunctionExecutorModule {}
