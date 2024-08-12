import { Module } from '@nestjs/common';

import { NestjsQueryGraphQLModule } from '@ptc-org/nestjs-query-graphql';
import { NestjsQueryTypeOrmModule } from '@ptc-org/nestjs-query-typeorm';

import { TypeORMModule } from 'src/database/typeorm/typeorm.module';
import { FeatureFlagEntity } from 'src/engine/core-modules/feature-flag/feature-flag.entity';
import { FeatureFlagFactory } from 'src/engine/core-modules/feature-flag/services/feature-flags.factory';
import { IsFeatureEnabledService } from 'src/engine/core-modules/feature-flag/services/is-feature-enabled.service';

@Module({
  imports: [
    TypeORMModule,
    NestjsQueryGraphQLModule.forFeature({
      imports: [
        NestjsQueryTypeOrmModule.forFeature([FeatureFlagEntity], 'core'),
      ],
      services: [],
      resolvers: [],
    }),
  ],
  exports: [IsFeatureEnabledService, FeatureFlagFactory],
  providers: [IsFeatureEnabledService, FeatureFlagFactory],
})
export class FeatureFlagModule {}
