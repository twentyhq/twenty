import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { NestjsQueryGraphQLModule } from '@ptc-org/nestjs-query-graphql';
import { NestjsQueryTypeOrmModule } from '@ptc-org/nestjs-query-typeorm';

import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { WorkspaceModule } from 'src/engine/core-modules/workspace/workspace.module';
import { TwentyConfigModule } from 'src/engine/core-modules/twenty-config/twenty-config.module';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { BillingPlans } from 'src/engine/core-modules/billing-plans/billing-plans.entity';
import { BillingPlansResolver } from 'src/engine/core-modules/billing-plans/billing-plans.resolver';
import { BillingPlansService } from 'src/engine/core-modules/billing-plans/billing-plans.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([BillingPlans], 'core'),
    NestjsQueryGraphQLModule.forFeature({
      imports: [
        NestjsQueryTypeOrmModule.forFeature([BillingPlans, Workspace], 'core'),
        WorkspaceModule,
      ],
    }),
    HttpModule,
    TwentyConfigModule,
  ],
  providers: [BillingPlansResolver, BillingPlansService, TwentyConfigService],
  exports: [],
})
export class BillingPlansModule {}
