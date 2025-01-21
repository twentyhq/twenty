import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';

import { NestjsQueryGraphQLModule } from '@ptc-org/nestjs-query-graphql';
import { NestjsQueryTypeOrmModule } from '@ptc-org/nestjs-query-typeorm';

import { StripeIntegrationResolver } from 'src/engine/core-modules/stripe/integrations/stripe-integration.resolver';
import { StripeIntegration } from 'src/engine/core-modules/stripe/integrations/stripe-integration.entity';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { StripeIntegrationService } from 'src/engine/core-modules/stripe/integrations/stripe-integration.service';
import { WorkspaceModule } from 'src/engine/core-modules/workspace/workspace.module';

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
  ],
  controllers: [SripeController],
  providers: [
    StripeIntegrationResolver,
    StripeIntegrationService,
  ],
  exports: [],
})
export class StripeModule {}
