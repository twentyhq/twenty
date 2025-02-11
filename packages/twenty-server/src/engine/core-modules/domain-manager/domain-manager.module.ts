import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { DomainManagerService } from 'src/engine/core-modules/domain-manager/services/domain-manager.service';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { CloudflareController } from 'src/engine/core-modules/domain-manager/controllers/cloudflare.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Workspace], 'core')],
  providers: [DomainManagerService],
  exports: [DomainManagerService],
  controllers: [CloudflareController],
})
export class DomainManagerModule {}
