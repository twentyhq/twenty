import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { DomainManagerService } from 'src/engine/core-modules/domain-manager/services/domain-manager.service';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { PublicDomain } from 'src/engine/core-modules/public-domain/public-domain.entity';
import { AuditModule } from 'src/engine/core-modules/audit/audit.module';

@Module({
  imports: [TypeOrmModule.forFeature([Workspace, PublicDomain]), AuditModule],
  providers: [DomainManagerService],
  exports: [DomainManagerService],
})
export class DomainManagerModule {}
