import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ClickHouseModule } from 'src/database/clickhouse/clickhouse.module';
import { ApiKeyEntity } from 'src/engine/core-modules/api-key/api-key.entity';
import { BillingUsageAllowanceResolver } from 'src/engine/core-modules/billing/services/billing-usage-allowance-resolver.service';
import { BillingModule } from 'src/engine/core-modules/billing/billing.module';
import { CacheLockModule } from 'src/engine/core-modules/cache-lock/cache-lock.module';
import { UsageAllowanceResolver } from 'src/engine/core-modules/usage-limit/interfaces/usage-allowance-resolver.interface';
import { UsageLimitQuotaService } from 'src/engine/core-modules/usage-limit/services/usage-limit-quota.service';
import { UsageModule } from 'src/engine/core-modules/usage/usage.module';
import { ApplicationEntity } from 'src/engine/core-modules/application/application.entity';
import { UserWorkspaceEntity } from 'src/engine/core-modules/user-workspace/user-workspace.entity';
import { AgentEntity } from 'src/engine/metadata-modules/ai/ai-agent/entities/agent.entity';
import { LogicFunctionEntity } from 'src/engine/metadata-modules/logic-function/logic-function.entity';
import { UsageLimitSpeedService } from 'src/engine/core-modules/usage-limit/services/usage-limit-speed.service';
import { UsageLimitResolver } from 'src/engine/core-modules/usage-limit/usage-limit.resolver';
import { UsageLimitService } from 'src/engine/core-modules/usage-limit/services/usage-limit.service';
import { UsageLimitRulesCacheService } from 'src/engine/core-modules/usage-limit/services/usage-limit-rules-cache.service';
import { UsageLimitEntity } from 'src/engine/core-modules/usage-limit/usage-limit.entity';
import { PermissionsModule } from 'src/engine/metadata-modules/permissions/permissions.module';
import { provideWorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/provide-workspace-scoped-repository';
import { WorkspaceCacheModule } from 'src/engine/workspace-cache/workspace-cache.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      UsageLimitEntity,
      ApiKeyEntity,
      ApplicationEntity,
      UserWorkspaceEntity,
      AgentEntity,
      LogicFunctionEntity,
    ]),
    WorkspaceCacheModule,
    PermissionsModule,
    BillingModule,
    CacheLockModule,
    ClickHouseModule,
    UsageModule,
  ],
  providers: [
    {
      provide: UsageAllowanceResolver,
      useClass: BillingUsageAllowanceResolver,
    },
    UsageLimitQuotaService,
    UsageLimitSpeedService,
    UsageLimitRulesCacheService,
    UsageLimitService,
    UsageLimitResolver,
    provideWorkspaceScopedRepository(UsageLimitEntity),
    provideWorkspaceScopedRepository(ApiKeyEntity),
    provideWorkspaceScopedRepository(ApplicationEntity),
    provideWorkspaceScopedRepository(UserWorkspaceEntity),
    provideWorkspaceScopedRepository(AgentEntity),
    provideWorkspaceScopedRepository(LogicFunctionEntity),
  ],
  exports: [
    UsageLimitQuotaService,
    UsageLimitSpeedService,
    UsageLimitRulesCacheService,
  ],
})
export class UsageLimitModule {}
