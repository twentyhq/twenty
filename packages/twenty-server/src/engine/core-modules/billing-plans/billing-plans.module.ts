import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { NestjsQueryGraphQLModule } from '@ptc-org/nestjs-query-graphql';
import { NestjsQueryTypeOrmModule } from '@ptc-org/nestjs-query-typeorm';

import { BillingPlans } from 'src/engine/core-modules/billing-plans/billing-plans.entity';
import { BillingPlansResolver } from 'src/engine/core-modules/billing-plans/billing-plans.resolver';
import { BillingPlansService } from 'src/engine/core-modules/billing-plans/billing-plans.service';
import { User } from 'src/engine/core-modules/user/user.entity';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { WorkspaceModule } from 'src/engine/core-modules/workspace/workspace.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([BillingPlans], 'core'),
    NestjsQueryGraphQLModule.forFeature({
      imports: [
        NestjsQueryTypeOrmModule.forFeature(
          [BillingPlans, Workspace, User],
          'core',
        ),
        WorkspaceModule,
      ],
    }),
    HttpModule,
  ],
  providers: [BillingPlansResolver, BillingPlansService],
  exports: [],
})
export class BillingPlansModule {}
