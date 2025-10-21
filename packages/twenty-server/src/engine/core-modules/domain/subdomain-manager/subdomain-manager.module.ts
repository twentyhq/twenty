import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { SubdomainManagerService } from 'src/engine/core-modules/domain/subdomain-manager/services/subdomain-manager.service';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Workspace])],
  providers: [SubdomainManagerService],
  exports: [SubdomainManagerService],
})
export class SubdomainManagerModule {}
