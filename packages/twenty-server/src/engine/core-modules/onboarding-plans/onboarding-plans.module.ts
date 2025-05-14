import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { NestjsQueryGraphQLModule } from '@ptc-org/nestjs-query-graphql';
import { NestjsQueryTypeOrmModule } from '@ptc-org/nestjs-query-typeorm';

import { OnboardingPlansController } from 'src/engine/core-modules/onboarding-plans/onboarding-plans.controller';
import { OnboardingPlans } from 'src/engine/core-modules/onboarding-plans/onboarding-plans.entity';
import { OnboardingPlansService } from 'src/engine/core-modules/onboarding-plans/onboarding-plans.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([OnboardingPlans], 'core'),
    NestjsQueryGraphQLModule.forFeature({
      imports: [NestjsQueryTypeOrmModule.forFeature([OnboardingPlans], 'core')],
    }),
  ],
  controllers: [OnboardingPlansController],
  providers: [OnboardingPlansService],
})
export class OnboardingPlansModule {}
