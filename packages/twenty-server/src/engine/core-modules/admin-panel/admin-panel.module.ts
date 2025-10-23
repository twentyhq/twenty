import { Module } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AdminPanelHealthService } from 'src/engine/core-modules/admin-panel/admin-panel-health.service';
import { AdminPanelQueueService } from 'src/engine/core-modules/admin-panel/admin-panel-queue.service';
import { AdminPanelResolver } from 'src/engine/core-modules/admin-panel/admin-panel.resolver';
import { AdminPanelService } from 'src/engine/core-modules/admin-panel/admin-panel.service';
import { AuditModule } from 'src/engine/core-modules/audit/audit.module';
import { AuthModule } from 'src/engine/core-modules/auth/auth.module';
import { WorkspaceDomainsModule } from 'src/engine/core-modules/domain/workspace-domains/workspace-domains.module';
import { FeatureFlagModule } from 'src/engine/core-modules/feature-flag/feature-flag.module';
import { FileModule } from 'src/engine/core-modules/file/file.module';
import { HealthModule } from 'src/engine/core-modules/health/health.module';
import { ImpersonationModule } from 'src/engine/core-modules/impersonation/impersonation.module';
import { RedisClientModule } from 'src/engine/core-modules/redis-client/redis-client.module';
import { TelemetryModule } from 'src/engine/core-modules/telemetry/telemetry.module';
import { UserEntity } from 'src/engine/core-modules/user/user.entity';
import { PermissionsModule } from 'src/engine/metadata-modules/permissions/permissions.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([UserEntity]),
    AuthModule,
    FileModule,
    WorkspaceDomainsModule,
    HealthModule,
    RedisClientModule,
    TerminusModule,
    FeatureFlagModule,
    AuditModule,
    TelemetryModule,
    ImpersonationModule,
    PermissionsModule,
  ],
  providers: [
    AdminPanelResolver,
    AdminPanelService,
    AdminPanelHealthService,
    AdminPanelQueueService,
  ],
  exports: [AdminPanelService],
})
export class AdminPanelModule {}
