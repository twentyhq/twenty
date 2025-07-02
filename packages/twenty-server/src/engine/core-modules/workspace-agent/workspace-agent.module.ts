import { forwardRef, Module } from '@nestjs/common';

import { NestjsQueryGraphQLModule } from '@ptc-org/nestjs-query-graphql';
import { NestjsQueryTypeOrmModule } from '@ptc-org/nestjs-query-typeorm';

import { TypeORMModule } from 'src/database/typeorm/typeorm.module';
import { TypeORMService } from 'src/database/typeorm/typeorm.service';
import { Inbox } from 'src/engine/core-modules/inbox/inbox.entity';
import { InboxModule } from 'src/engine/core-modules/inbox/inbox.module';
import { Sector } from 'src/engine/core-modules/sector/sector.entity';
import { SectorService } from 'src/engine/core-modules/sector/sector.service';
import { WorkspaceAgent } from 'src/engine/core-modules/workspace-agent/workspace-agent.entity';
import { AgentResolver } from 'src/engine/core-modules/workspace-agent/workspace-agent.resolver';
import { AgentService } from 'src/engine/core-modules/workspace-agent/workspace-agent.service';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { WorkspaceModule } from 'src/engine/core-modules/workspace/workspace.module';
import { DataSourceModule } from 'src/engine/metadata-modules/data-source/data-source.module';

@Module({
  imports: [
    NestjsQueryGraphQLModule.forFeature({
      imports: [
        NestjsQueryTypeOrmModule.forFeature(
          [WorkspaceAgent, Workspace, Sector, Inbox],
          'core',
        ),
        TypeORMModule,
        InboxModule,
      ],
    }),
    DataSourceModule,
    forwardRef(() => WorkspaceModule),
  ],
  exports: [AgentService],
  providers: [AgentService, AgentResolver, TypeORMService, SectorService],
})
export class AgentModule {}
