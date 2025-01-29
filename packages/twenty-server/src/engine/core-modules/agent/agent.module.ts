import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { NestjsQueryGraphQLModule } from '@ptc-org/nestjs-query-graphql';
import { NestjsQueryTypeOrmModule } from '@ptc-org/nestjs-query-typeorm';

import { TypeORMModule } from 'src/database/typeorm/typeorm.module';
import { TypeORMService } from 'src/database/typeorm/typeorm.service';
import { Agent } from 'src/engine/core-modules/agent/agent.entity';
import { AgentResolver } from 'src/engine/core-modules/agent/agent.resolver';
import { AgentService } from 'src/engine/core-modules/agent/agent.service';
import { KeyValuePair } from 'src/engine/core-modules/key-value-pair/key-value-pair.entity';
import { Sector } from 'src/engine/core-modules/sector/sector.entity';
import { SectorService } from 'src/engine/core-modules/sector/sector.service';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { WorkspaceModule } from 'src/engine/core-modules/workspace/workspace.module';
import { DataSourceModule } from 'src/engine/metadata-modules/data-source/data-source.module';

@Module({
  imports: [
    NestjsQueryGraphQLModule.forFeature({
      imports: [
        NestjsQueryTypeOrmModule.forFeature([Agent, Workspace, Sector], 'core'),
        TypeORMModule,
      ],
    }),
    DataSourceModule,
    forwardRef(() => WorkspaceModule),
    TypeOrmModule.forFeature([KeyValuePair], 'core'),
  ],
  exports: [AgentService],
  providers: [AgentService, AgentResolver, TypeORMService, SectorService],
})
export class AgentModule {}
