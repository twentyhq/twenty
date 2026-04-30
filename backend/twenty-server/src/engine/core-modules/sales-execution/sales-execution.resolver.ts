import { UseGuards } from '@nestjs/common';
import { Args, Mutation, Query, Float, Int } from '@nestjs/graphql';
import { Field, ObjectType, InputType } from '@nestjs/graphql';

import { MetadataResolver } from 'src/engine/api/graphql/graphql-config/decorators/metadata-resolver.decorator';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import { WorkspaceAuthGuard } from 'src/engine/guards/workspace-auth.guard';
import { UserAuthGuard } from 'src/engine/guards/user-auth.guard';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';

import { SalesExecutionService } from './territory.service';
import { DealOperationsService } from './deal-operations.service';

// --- Territory DTOs ---
@ObjectType()
class TerritoryDTO {
  @Field() id: string;
  @Field() name: string;
  @Field(() => Float, { nullable: true }) quota: number;
  @Field(() => [String], { nullable: true }) regions: string[];
  @Field(() => [String], { nullable: true }) industries: string[];
  @Field(() => [String], { nullable: true }) assignees: string[];
}

@ObjectType()
class TerritorySummaryDTO {
  @Field(() => Int) territories: number;
  @Field(() => Float) totalQuota: number;
  @Field(() => Float) averageQuota: number;
  @Field(() => Int) assignedTerritories: number;
  @Field(() => Int) regions: number;
  @Field(() => Int) industries: number;
}

@ObjectType()
class QuotaDTO {
  @Field() id: string;
  @Field() userId: string;
  @Field() period: string;
  @Field(() => Float) targetAmount: number;
  @Field(() => Float) achievedAmount: number;
  @Field() status: string;
}

@ObjectType()
class QuotaOverviewDTO {
  @Field(() => Int) quotas: number;
  @Field(() => Float) totalTargetAmount: number;
  @Field(() => Float) totalAchievedAmount: number;
  @Field(() => Int) atRiskCount: number;
  @Field(() => Int) achievementRate: number;
}

@ObjectType()
class BlueprintDTO {
  @Field() id: string;
  @Field() name: string;
  @Field() isActive: boolean;
  @Field() createdAt: Date;
}

@ObjectType()
class BlueprintSummaryDTO {
  @Field(() => Int) blueprints: number;
  @Field(() => Int) activeBlueprints: number;
  @Field(() => Int) totalRules: number;
  @Field(() => Int) requiredFields: number;
}

@ObjectType()
class ValidationResultDTO {
  @Field() valid: boolean;
  @Field({ nullable: true }) blueprintId: string;
  @Field() stage: string;
  @Field(() => [String]) missingFields: string[];
  @Field(() => [String]) allowedNextStages: string[];
}

@InputType()
class CreateTerritoryInput {
  @Field() name: string;
  @Field(() => Float, { nullable: true }) quota?: number;
  @Field(() => [String], { nullable: true }) regions?: string[];
  @Field(() => [String], { nullable: true }) industries?: string[];
  @Field(() => [String], { nullable: true }) assignees?: string[];
}

@InputType()
class AssignQuotaInput {
  @Field() userId: string;
  @Field() period: string;
  @Field(() => Float) amount: number;
}

@InputType()
class UpdateProgressInput {
  @Field() quotaId: string;
  @Field(() => Float) achieved: number;
}

@InputType()
class CreateBlueprintInput {
  @Field() name: string;
  @Field({ nullable: true }) isActive?: boolean;
  @Field(() => [String], { nullable: true }) requiredFields?: string[];
}

@InputType()
class CloneOpportunityInput {
  @Field() opportunityId: string;
  @Field({ nullable: true }) name?: string;
  @Field({ nullable: true }) stage?: string;
}

// --- Resolver ---
@MetadataResolver()
@UseGuards(WorkspaceAuthGuard, UserAuthGuard)
export class SalesExecutionResolver {
  constructor(
    private readonly salesService: SalesExecutionService,
    private readonly dealOpsService: DealOperationsService,
  ) {}

  // Territory queries
  @Query(() => [TerritoryDTO])
  async territories(@AuthWorkspace() workspace: WorkspaceEntity) {
    return this.salesService.getTerritories(workspace.id);
  }

  @Query(() => TerritorySummaryDTO)
  async territorySummary(@AuthWorkspace() workspace: WorkspaceEntity) {
    return this.salesService.getTerritorySummary(workspace.id);
  }

  // Territory mutations
  @Mutation(() => TerritoryDTO)
  async createTerritory(
    @AuthWorkspace() workspace: WorkspaceEntity,
    @Args('input') input: CreateTerritoryInput,
  ) {
    return this.salesService.createTerritory(workspace.id, input);
  }

  @Mutation(() => TerritoryDTO)
  async updateTerritoryQuota(
    @Args('territoryId') territoryId: string,
    @Args('quota', { type: () => Float }) quota: number,
  ) {
    return this.salesService.updateTerritoryQuota(territoryId, quota);
  }

  @Mutation(() => TerritoryDTO)
  async setTerritoryAssignees(
    @Args('territoryId') territoryId: string,
    @Args('assignees', { type: () => [String] }) assignees: string[],
  ) {
    return this.salesService.setTerritoryAssignees(territoryId, assignees);
  }

  // Quota queries and mutations
  @Query(() => QuotaDTO, { nullable: true })
  async quotaStatus(
    @AuthWorkspace() workspace: WorkspaceEntity,
    @Args('userId') userId: string,
    @Args('period') period: string,
  ) {
    return this.salesService.getQuotaStatus(workspace.id, userId, period);
  }

  @Query(() => QuotaOverviewDTO)
  async quotaOverview(
    @AuthWorkspace() workspace: WorkspaceEntity,
    @Args('period', { nullable: true }) period?: string,
  ) {
    return this.salesService.getQuotaOverview(workspace.id, period);
  }

  @Mutation(() => QuotaDTO)
  async assignQuota(
    @AuthWorkspace() workspace: WorkspaceEntity,
    @Args('input') input: AssignQuotaInput,
  ) {
    return this.salesService.assignQuota(workspace.id, input.userId, input.period, input.amount);
  }

  @Mutation(() => QuotaDTO)
  async updateQuotaProgress(@Args('input') input: UpdateProgressInput) {
    return this.salesService.updateProgress(input.quotaId, input.achieved);
  }

  // Blueprint queries and mutations
  @Query(() => [BlueprintDTO])
  async blueprints(@AuthWorkspace() workspace: WorkspaceEntity) {
    return this.dealOpsService.listBlueprints(workspace.id);
  }

  @Query(() => BlueprintSummaryDTO)
  async blueprintSummary(@AuthWorkspace() workspace: WorkspaceEntity) {
    return this.dealOpsService.getBlueprintSummary(workspace.id);
  }

  @Mutation(() => BlueprintDTO)
  async createBlueprint(
    @AuthWorkspace() workspace: WorkspaceEntity,
    @Args('input') input: CreateBlueprintInput,
  ) {
    return this.dealOpsService.createBlueprint(workspace.id, input);
  }

  @Query(() => ValidationResultDTO)
  async validateOpportunity(
    @AuthWorkspace() workspace: WorkspaceEntity,
    @Args('opportunityId') opportunityId: string,
    @Args('blueprintId', { nullable: true }) blueprintId?: string,
  ) {
    return this.dealOpsService.validateOpportunityAgainstBlueprint(workspace.id, opportunityId, blueprintId);
  }

  @Mutation(() => Boolean)
  async cloneOpportunity(
    @AuthWorkspace() workspace: WorkspaceEntity,
    @Args('input') input: CloneOpportunityInput,
  ) {
    await this.dealOpsService.cloneOpportunity(workspace.id, input.opportunityId, {
      name: input.name,
      stage: input.stage,
    });
    return true;
  }
}
