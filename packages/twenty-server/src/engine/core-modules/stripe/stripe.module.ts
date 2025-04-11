import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';

import { NestjsQueryGraphQLModule } from '@ptc-org/nestjs-query-graphql';
import { NestjsQueryTypeOrmModule } from '@ptc-org/nestjs-query-typeorm';

import { StripeIntegration } from 'src/engine/core-modules/stripe/integrations/stripe-integration.entity';
import { StripeIntegrationResolver } from 'src/engine/core-modules/stripe/integrations/stripe-integration.resolver';
import { StripeIntegrationService } from 'src/engine/core-modules/stripe/integrations/stripe-integration.service';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { WorkspaceModule } from 'src/engine/core-modules/workspace/workspace.module';

import { TwentyConfigModule } from 'src/engine/core-modules/twenty-config/twenty-config.module';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { SripeController } from './stripe.controller';

@Module({
  imports: [
    NestjsQueryGraphQLModule.forFeature({
      imports: [
        NestjsQueryTypeOrmModule.forFeature(
          [StripeIntegration, Workspace],
          'core',
        ),
        WorkspaceModule,
      ],
    }),
    HttpModule,
    TwentyConfigModule,
  ],
  controllers: [SripeController],
  providers: [
    StripeIntegrationResolver,
    StripeIntegrationService,
    TwentyConfigService,
  ],
  exports: [],
})
export class StripeModule {}
