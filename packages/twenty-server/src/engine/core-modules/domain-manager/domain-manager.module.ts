import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AuditModule } from 'src/engine/core-modules/audit/audit.module';
import { CloudflareController } from 'src/engine/core-modules/domain-manager/controllers/cloudflare.controller';
import { CustomDomainService } from 'src/engine/core-modules/domain-manager/services/custom-domain.service';
import { DomainManagerService } from 'src/engine/core-modules/domain-manager/services/domain-manager.service';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';

@Module({
  imports: [AuditModule, TypeOrmModule.forFeature([Workspace], 'core')],
  providers: [DomainManagerService, CustomDomainService],
  exports: [DomainManagerService, CustomDomainService],
  controllers: [CloudflareController],
})
export class DomainManagerModule {}
