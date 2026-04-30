import { UseGuards } from '@nestjs/common';
import { Args, Mutation, Query, Float, Int } from '@nestjs/graphql';
import { Field, ObjectType, InputType } from '@nestjs/graphql';

import { MetadataResolver } from 'src/engine/api/graphql/graphql-config/decorators/metadata-resolver.decorator';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import { WorkspaceAuthGuard } from 'src/engine/guards/workspace-auth.guard';
import { UserAuthGuard } from 'src/engine/guards/user-auth.guard';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { PLGIntelligenceService } from './plg-intelligence.service';

@ObjectType()
class ProductUsageEventDTO {
  @Field() id: string;
  @Field() featureName: string;
  @Field({ nullable: true }) action?: string;
  @Field(() => Int, { nullable: true }) count?: number;
}

@ObjectType()
class PQLScoreDTO {
  @Field() id: string;
  @Field() accountId: string;
  @Field(() => Float) score: number;
  @Field() grade: string;
  @Field(() => Int) activeUsers: number;
  @Field(() => Int) featuresBreadth: number;
}

@ObjectType()
class TrialMetricsDTO {
  @Field(() => Int) totalTrials: number;
  @Field(() => Int) activeTrials: number;
  @Field(() => Int) convertedTrials: number;
  @Field(() => Int) expiredTrials: number;
  @Field(() => Int) conversionRate: number;
  @Field(() => Int) avgDaysToConvert: number;
}

@ObjectType()
class ConversionPredictionDTO {
  @Field(() => Float) probability: number;
  @Field() recommendation: string;
}

@ObjectType()
class FeatureUsageDTO {
  @Field() featureName: string;
  @Field(() => Int) totalUsage: number;
  @Field(() => Int) uniqueUsers: number;
  @Field(() => Int) avgDurationMs: number;
}

@InputType()
class TrackUsageInput {
  @Field() userId: string;
  @Field() featureName: string;
  @Field({ nullable: true }) action?: string;
  @Field(() => Int, { nullable: true }) count?: number;
  @Field(() => Int, { nullable: true }) durationMs?: number;
}

@MetadataResolver()
@UseGuards(WorkspaceAuthGuard, UserAuthGuard)
export class PLGIntelligenceResolver {
  constructor(private readonly service: PLGIntelligenceService) {}

  @Mutation(() => ProductUsageEventDTO)
  async trackProductUsage(
    @AuthWorkspace() workspace: WorkspaceEntity,
    @Args('input') input: TrackUsageInput,
  ) {
    return this.service.trackUsage(workspace.id, input);
  }

  @Mutation(() => PQLScoreDTO)
  async calculatePQLScore(
    @AuthWorkspace() workspace: WorkspaceEntity,
    @Args('accountId') accountId: string,
  ) {
    return this.service.calculatePQL(workspace.id, accountId);
  }

  @Query(() => TrialMetricsDTO)
  async getTrialMetrics(@AuthWorkspace() workspace: WorkspaceEntity) {
    return this.service.getTrialMetrics(workspace.id);
  }

  @Query(() => ConversionPredictionDTO)
  async predictConversion(
    @AuthWorkspace() workspace: WorkspaceEntity,
    @Args('accountId') accountId: string,
  ) {
    return this.service.predictConversion(workspace.id, accountId);
  }

  @Query(() => [FeatureUsageDTO])
  async getFeatureUsage(@AuthWorkspace() workspace: WorkspaceEntity) {
    return this.service.getFeatureUsage(workspace.id);
  }
}
