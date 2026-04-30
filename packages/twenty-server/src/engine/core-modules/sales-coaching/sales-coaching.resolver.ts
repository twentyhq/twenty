import { UseGuards } from '@nestjs/common';
import { Args, Mutation, Query, Float, Int } from '@nestjs/graphql';
import { Field, ObjectType, InputType } from '@nestjs/graphql';

import { MetadataResolver } from 'src/engine/api/graphql/graphql-config/decorators/metadata-resolver.decorator';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import { WorkspaceAuthGuard } from 'src/engine/guards/workspace-auth.guard';
import { UserAuthGuard } from 'src/engine/guards/user-auth.guard';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { SalesCoachingService } from './sales-coaching.service';

@ObjectType()
class CoachingSessionDTO {
  @Field() id: string;
  @Field() title: string;
  @Field({ nullable: true }) status?: string;
  @Field({ nullable: true }) repId?: string;
  @Field(() => Float, { nullable: true }) overallRating?: number;
}

@ObjectType()
class CallReviewDTO {
  @Field() id: string;
  @Field({ nullable: true }) callTitle?: string;
  @Field({ nullable: true }) outcome?: string;
  @Field(() => Float, { nullable: true }) overallScore?: number;
  @Field(() => Float, { nullable: true }) talkRatio?: number;
}

@ObjectType()
class RepScorecardDTO {
  @Field() id: string;
  @Field() repId: string;
  @Field(() => Float) overallScore: number;
  @Field(() => Int) callsReviewed: number;
  @Field(() => Float, { nullable: true }) winRate?: number;
}

@ObjectType()
class SkillGapDTO {
  @Field() id: string;
  @Field() category: string;
  @Field() severity: string;
  @Field(() => Float) gapSize: number;
  @Field(() => Float) currentLevel: number;
  @Field(() => Float) targetLevel: number;
}

@ObjectType()
class TeamBenchmarkDTO {
  @Field() repId: string;
  @Field(() => Float) overallScore: number;
  @Field(() => Int) callsReviewed: number;
  @Field(() => Float) winRate: number;
  @Field(() => Int) rank: number;
}

@ObjectType()
class TrainingSuggestionDTO {
  @Field() category: string;
  @Field() severity: string;
  @Field(() => Float) gapSize: number;
  @Field(() => [String]) recommendations: string[];
}

@InputType()
class CreateSessionInput {
  @Field() repId: string;
  @Field() title: string;
  @Field({ nullable: true }) coachId?: string;
  @Field({ nullable: true }) agenda?: string;
  @Field({ nullable: true }) scheduledAt?: string;
}

@InputType()
class ReviewCallInput {
  @Field() repId: string;
  @Field({ nullable: true }) callTitle?: string;
  @Field({ nullable: true }) dealId?: string;
  @Field(() => Float, { nullable: true }) talkRatio?: number;
  @Field(() => Float, { nullable: true }) discoveryScore?: number;
  @Field(() => Float, { nullable: true }) objectionHandlingScore?: number;
  @Field(() => Float, { nullable: true }) closingScore?: number;
  @Field(() => Float, { nullable: true }) presentationScore?: number;
  @Field({ nullable: true }) feedback?: string;
}

@MetadataResolver()
@UseGuards(WorkspaceAuthGuard, UserAuthGuard)
export class SalesCoachingResolver {
  constructor(private readonly service: SalesCoachingService) {}

  @Mutation(() => CoachingSessionDTO)
  async createCoachingSession(
    @AuthWorkspace() workspace: WorkspaceEntity,
    @Args('input') input: CreateSessionInput,
  ) {
    return this.service.createSession(workspace.id, {
      ...input,
      scheduledAt: input.scheduledAt ? new Date(input.scheduledAt) : undefined,
    });
  }

  @Mutation(() => CallReviewDTO)
  async reviewSalesCall(
    @AuthWorkspace() workspace: WorkspaceEntity,
    @Args('input') input: ReviewCallInput,
  ) {
    return this.service.reviewCall(workspace.id, input);
  }

  @Mutation(() => RepScorecardDTO)
  async generateRepScorecard(
    @AuthWorkspace() workspace: WorkspaceEntity,
    @Args('repId') repId: string,
    @Args('periodStart') periodStart: string,
    @Args('periodEnd') periodEnd: string,
  ) {
    return this.service.generateScorecard(workspace.id, repId, new Date(periodStart), new Date(periodEnd));
  }

  @Query(() => [SkillGapDTO])
  async identifySkillGaps(
    @AuthWorkspace() workspace: WorkspaceEntity,
    @Args('repId') repId: string,
  ) {
    return this.service.identifySkillGaps(workspace.id, repId);
  }

  @Query(() => [TeamBenchmarkDTO])
  async getTeamBenchmarks(@AuthWorkspace() workspace: WorkspaceEntity) {
    return this.service.getTeamBenchmarks(workspace.id);
  }

  @Query(() => [TrainingSuggestionDTO])
  async suggestTraining(
    @AuthWorkspace() workspace: WorkspaceEntity,
    @Args('repId') repId: string,
  ) {
    return this.service.suggestTraining(workspace.id, repId);
  }
}
