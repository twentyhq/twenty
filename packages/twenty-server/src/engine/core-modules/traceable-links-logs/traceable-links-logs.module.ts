// traceable-link-logs/traceable-link-logs.module.ts

import { forwardRef, Module } from '@nestjs/common';

import { NestjsQueryGraphQLModule } from '@ptc-org/nestjs-query-graphql';
import { NestjsQueryTypeOrmModule } from '@ptc-org/nestjs-query-typeorm';

import { TypeORMService } from 'src/database/typeorm/typeorm.service';
import { TraceableLinkLog } from 'src/engine/core-modules/traceable-links-logs/traceable-links-logs.entity';
import { TraceableLinkLogsResolver } from 'src/engine/core-modules/traceable-links-logs/traceable-links-logs.resolver';
import { TraceableLinkLogsService } from 'src/engine/core-modules/traceable-links-logs/traceable-links-logs.service';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { WorkspaceModule } from 'src/engine/core-modules/workspace/workspace.module';
import { DataSourceModule } from 'src/engine/metadata-modules/data-source/data-source.module';

@Module({
  imports: [
    NestjsQueryGraphQLModule.forFeature({
      imports: [
        NestjsQueryTypeOrmModule.forFeature(
          [TraceableLinkLog, Workspace],
          'core',
        ),
      ],
    }),
    DataSourceModule,
    forwardRef(() => WorkspaceModule),
  ],
  exports: [TraceableLinkLogsService],
  providers: [
    TraceableLinkLogsService,
    TraceableLinkLogsResolver,
    TypeORMService,
  ],
})
export class TraceableLinkLogsModule {}
