import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AuditModule } from 'src/engine/core-modules/audit/audit.module';
import { TokenModule } from 'src/engine/core-modules/auth/token/token.module';
import { FileModule } from 'src/engine/core-modules/file/file.module';
import { LogicFunctionBuildModule } from 'src/engine/core-modules/logic-function/logic-function-build/logic-function-build.module';
import { AddPackagesCommand } from 'src/engine/core-modules/logic-function/logic-function-executor/commands/add-packages.command';
import { LogicFunctionExecutorService } from 'src/engine/core-modules/logic-function/logic-function-executor/services/logic-function-executor.service';
import { SecretEncryptionModule } from 'src/engine/core-modules/secret-encryption/secret-encryption.module';
import { ThrottlerModule } from 'src/engine/core-modules/throttler/throttler.module';
import { LogicFunctionEntity } from 'src/engine/metadata-modules/logic-function/logic-function.entity';
import { SubscriptionsModule } from 'src/engine/subscriptions/subscriptions.module';
import { WorkspaceCacheModule } from 'src/engine/workspace-cache/workspace-cache.module';
import { LogicFunctionLayerModule } from 'src/engine/metadata-modules/logic-function-layer/logic-function-layer.module';

@Module({
  imports: [
    ThrottlerModule,
    AuditModule,
    TokenModule,
    SecretEncryptionModule,
    SubscriptionsModule,
    WorkspaceCacheModule,
    LogicFunctionBuildModule,
    LogicFunctionLayerModule,
    FileModule,
    TypeOrmModule.forFeature([LogicFunctionEntity]),
  ],
  providers: [LogicFunctionExecutorService, AddPackagesCommand],
  exports: [LogicFunctionExecutorService],
})
export class LogicFunctionExecutorModule {}
