import { forwardRef, Module } from '@nestjs/common';

import { NestjsQueryGraphQLModule } from '@ptc-org/nestjs-query-graphql';
import { NestjsQueryTypeOrmModule } from '@ptc-org/nestjs-query-typeorm';

import { TypeORMModule } from 'src/database/typeorm/typeorm.module';
import { TypeORMService } from 'src/database/typeorm/typeorm.service';
import { Sector } from 'src/engine/core-modules/sector/sector.entity';
import { SectorResolver } from 'src/engine/core-modules/sector/sector.resolver';
import { SectorService } from 'src/engine/core-modules/sector/sector.service';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { WorkspaceModule } from 'src/engine/core-modules/workspace/workspace.module';

@Module({
  imports: [
    NestjsQueryGraphQLModule.forFeature({
      imports: [
        NestjsQueryTypeOrmModule.forFeature([Sector, Workspace], 'core'),
        TypeORMModule,
      ],
    }),
    forwardRef(() => WorkspaceModule),
  ],
  exports: [SectorService],
  providers: [SectorService, SectorResolver, TypeORMService],
})
export class SectorModule {}
