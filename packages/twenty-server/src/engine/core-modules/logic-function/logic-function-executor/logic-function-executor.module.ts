import { Module } from '@nestjs/common';

import { BillingModule } from 'src/engine/core-modules/billing/billing.module';
import { LogicFunctionExecutorService } from 'src/engine/core-modules/logic-function/logic-function-executor/logic-function-executor.service';
import { AuditModule } from 'src/engine/core-modules/audit/audit.module';
import { TokenModule } from 'src/engine/core-modules/auth/token/token.module';
import { SecretEncryptionModule } from 'src/engine/core-modules/secret-encryption/secret-encryption.module';
import { ThrottlerModule } from 'src/engine/core-modules/throttler/throttler.module';
import { SubscriptionsModule } from 'src/engine/subscriptions/subscriptions.module';
import { WorkspaceCacheModule } from 'src/engine/workspace-cache/workspace-cache.module';

@Module({
  imports: [
    ThrottlerModule,
    AuditModule,
    TokenModule,
    SecretEncryptionModule,
    SubscriptionsModule,
    WorkspaceCacheModule,
    BillingModule,
  ],
  providers: [LogicFunctionExecutorService],
  exports: [LogicFunctionExecutorService],
})
export class LogicFunctionExecutorModule {}
