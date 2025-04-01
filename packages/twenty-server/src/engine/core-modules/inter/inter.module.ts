import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';

import { NestjsQueryGraphQLModule } from '@ptc-org/nestjs-query-graphql';
import { NestjsQueryTypeOrmModule } from '@ptc-org/nestjs-query-typeorm';

import { TypeORMModule } from 'src/database/typeorm/typeorm.module';
import { TypeORMService } from 'src/database/typeorm/typeorm.service';
import { EnvironmentModule } from 'src/engine/core-modules/environment/environment.module';
import { EnvironmentService } from 'src/engine/core-modules/environment/environment.service';
import { InterIntegration } from 'src/engine/core-modules/inter/integration/inter-integration.entity';
import { InterIntegrationResolver } from 'src/engine/core-modules/inter/integration/inter-integration.resolver';
import { InterIntegrationService } from 'src/engine/core-modules/inter/integration/inter-integration.service';
import { InterResolver } from 'src/engine/core-modules/inter/inter.resolver';
import { InterService } from 'src/engine/core-modules/inter/inter.service';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { WorkspaceModule } from 'src/engine/core-modules/workspace/workspace.module';

@Module({
  imports: [
    NestjsQueryGraphQLModule.forFeature({
      imports: [
        NestjsQueryTypeOrmModule.forFeature(
          [InterIntegration, Workspace],
          'core',
        ),
        TypeORMModule,
      ],
    }),
    HttpModule,
    EnvironmentModule,
    WorkspaceModule,
  ],
  providers: [
    TypeORMModule,
    InterIntegrationResolver,
    InterIntegrationService,
    EnvironmentService,
    TypeORMService,
    InterService,
    InterResolver,
  ],
  exports: [],
})
export class InterModule {}
