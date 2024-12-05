import { Module } from '@nestjs/common';

import { NestjsQueryTypeOrmModule } from '@ptc-org/nestjs-query-typeorm';

import { DomainManagerService } from 'src/engine/core-modules/domain-manager/service/domain-manager.service';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';

@Module({
  imports: [NestjsQueryTypeOrmModule.forFeature([Workspace], 'core')],
  providers: [DomainManagerService],
  exports: [DomainManagerService],
})
export class DomainManagerModule {}
