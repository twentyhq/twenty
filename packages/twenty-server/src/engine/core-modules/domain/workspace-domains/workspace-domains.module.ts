import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { DomainServerConfigModule } from 'src/engine/core-modules/domain/domain-server-config/domain-server-config.module';
import { WorkspaceDomainsService } from 'src/engine/core-modules/domain/workspace-domains/services/workspace-domains.service';
import { PublicDomain } from 'src/engine/core-modules/public-domain/public-domain.entity';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';

@Module({
  imports: [
    DomainServerConfigModule,
    TypeOrmModule.forFeature([Workspace, PublicDomain]),
  ],
  providers: [WorkspaceDomainsService],
  exports: [WorkspaceDomainsService],
})
export class WorkspaceDomainsModule {}
