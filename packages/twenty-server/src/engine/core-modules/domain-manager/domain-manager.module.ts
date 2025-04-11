import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { DomainManagerService } from 'src/engine/core-modules/domain-manager/services/domain-manager.service';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { CloudflareController } from 'src/engine/core-modules/domain-manager/controllers/cloudflare.controller';
import { CustomDomainService } from 'src/engine/core-modules/domain-manager/services/custom-domain.service';
import { AnalyticsModule } from 'src/engine/core-modules/analytics/analytics.module';

@Module({
  imports: [AnalyticsModule, TypeOrmModule.forFeature([Workspace], 'core')],
  providers: [DomainManagerService, CustomDomainService],
  exports: [DomainManagerService, CustomDomainService],
  controllers: [CloudflareController],
})
export class DomainManagerModule {}
