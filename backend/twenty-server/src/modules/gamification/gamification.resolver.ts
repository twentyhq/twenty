import { UseGuards } from '@nestjs/common';
import { Args, Mutation, Query, Float, Int } from '@nestjs/graphql';
import { Field, ObjectType, InputType } from '@nestjs/graphql';

import { MetadataResolver } from 'src/engine/api/graphql/graphql-config/decorators/metadata-resolver.decorator';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import { WorkspaceAuthGuard } from 'src/engine/guards/workspace-auth.guard';
import { UserAuthGuard } from 'src/engine/guards/user-auth.guard';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { GamificationService } from './gamification.service';

// --- DTOs ---
@ObjectType()
class LeaderboardEntryDTO {
  @Field() id: string;
  @Field() userId: string;
  @Field() period: string;
  @Field(() => Int) points: number;
  @Field(() => Int) dealsWon: number;
  @Field(() => Float) revenue: number;
  @Field(() => Int) rank: number;
}

@ObjectType()
class BadgeDTO {
  @Field() id: string;
  @Field() userId: string;
  @Field() name: string;
  @Field({ nullable: true }) type?: string;
  @Field({ nullable: true }) description?: string;
}

@ObjectType()
class SalesChallengeDTO {
  @Field() id: string;
  @Field({ nullable: true }) name?: string;
  @Field({ nullable: true }) isActive?: boolean;
}

@InputType()
class RecordActivityInput {
  @Field() userId: string;
  @Field() period: string;
  @Field(() => Int, { nullable: true }) dealsWon?: number;
  @Field(() => Float, { nullable: true }) revenue?: number;
  @Field(() => Int, { nullable: true }) activitiesCompleted?: number;
  @Field(() => Int, { nullable: true }) points?: number;
}

@InputType()
class CreateChallengeInput {
  @Field() name: string;
  @Field({ nullable: true }) description?: string;
  @Field({ nullable: true }) metric?: string;
  @Field(() => Float, { nullable: true }) target?: number;
  @Field({ nullable: true }) startDate?: Date;
  @Field({ nullable: true }) endDate?: Date;
}

// --- Resolver ---
@MetadataResolver()
@UseGuards(WorkspaceAuthGuard, UserAuthGuard)
export class GamificationResolver {
  constructor(private readonly service: GamificationService) {}

  @Mutation(() => LeaderboardEntryDTO)
  async recordActivity(
    @AuthWorkspace() workspace: WorkspaceEntity,
    @Args('input') input: RecordActivityInput,
  ) {
    return this.service.recordActivity(workspace.id, input.userId, input.period, {
      dealsWon: input.dealsWon, revenue: input.revenue,
      activitiesCompleted: input.activitiesCompleted, points: input.points,
    });
  }

  @Query(() => [LeaderboardEntryDTO])
  async getLeaderboard(
    @AuthWorkspace() workspace: WorkspaceEntity,
    @Args('period') period: string,
  ) {
    return this.service.getLeaderboard(workspace.id, period);
  }

  @Mutation(() => BadgeDTO)
  async awardBadge(
    @AuthWorkspace() workspace: WorkspaceEntity,
    @Args('userId') userId: string,
    @Args('type') type: string,
    @Args('name') name: string,
    @Args('description', { nullable: true }) description?: string,
  ) {
    return this.service.awardBadge(workspace.id, userId, type as any, name, description);
  }

  @Mutation(() => SalesChallengeDTO)
  async createChallenge(
    @AuthWorkspace() workspace: WorkspaceEntity,
    @Args('input') input: CreateChallengeInput,
  ) {
    return this.service.createChallenge(workspace.id, input);
  }

  @Query(() => [SalesChallengeDTO])
  async getActiveChallenges(@AuthWorkspace() workspace: WorkspaceEntity) {
    return this.service.getActiveChallenges(workspace.id);
  }
}
