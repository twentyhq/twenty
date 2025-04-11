import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { NestjsQueryGraphQLModule } from '@ptc-org/nestjs-query-graphql';
import { NestjsQueryTypeOrmModule } from '@ptc-org/nestjs-query-typeorm';

import { InterIntegration } from 'src/engine/core-modules/inter/integration/inter-integration.entity';
import { InterIntegrationResolver } from 'src/engine/core-modules/inter/integration/inter-integration.resolver';
import { InterIntegrationService } from 'src/engine/core-modules/inter/integration/inter-integration.service';
import { InterResolver } from 'src/engine/core-modules/inter/inter.resolver';
import { InterService } from 'src/engine/core-modules/inter/inter.service';
import { TwentyConfigModule } from 'src/engine/core-modules/twenty-config/twenty-config.module';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { WorkspaceModule } from 'src/engine/core-modules/workspace/workspace.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([InterIntegration], 'core'),
    NestjsQueryGraphQLModule.forFeature({
      imports: [
        NestjsQueryTypeOrmModule.forFeature(
          [InterIntegration, Workspace],
          'core',
        ),
        WorkspaceModule,
      ],
    }),
    HttpModule,
    TwentyConfigModule,
  ],
  providers: [
    InterIntegrationResolver,
    InterIntegrationService,
    TwentyConfigService,
    InterService,
    InterResolver,
  ],
  exports: [],
})
export class InterModule {}
