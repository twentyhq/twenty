import { UseGuards } from '@nestjs/common';
import { Args, Mutation, Query, Float, Int } from '@nestjs/graphql';
import { Field, ObjectType, InputType } from '@nestjs/graphql';

import { MetadataResolver } from 'src/engine/api/graphql/graphql-config/decorators/metadata-resolver.decorator';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import { WorkspaceAuthGuard } from 'src/engine/guards/workspace-auth.guard';
import { UserAuthGuard } from 'src/engine/guards/user-auth.guard';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { AIGovernanceService } from './ai-governance.service';

@ObjectType()
class AIUsageLogDTO {
  @Field() id: string;
  @Field() provider: string;
  @Field() model: string;
  @Field(() => Int) inputTokens: number;
  @Field(() => Int) outputTokens: number;
  @Field(() => Float) cost: number;
  @Field({ nullable: true }) piiDetected?: boolean;
}

@ObjectType()
class MaskPIIResultDTO {
  @Field() maskedText: string;
}

@ObjectType()
class ModelConfigDTO {
  @Field() id: string;
  @Field() provider: string;
  @Field() modelId: string;
  @Field({ nullable: true }) displayName?: string;
  @Field() isEnabled: boolean;
  @Field(() => Float, { nullable: true }) monthlyBudget?: number;
  @Field(() => Float, { nullable: true }) monthlySpend?: number;
}

@ObjectType()
class GovernanceResultDTO {
  @Field() maskedInput: string;
  @Field() auditId: string;
  @Field() approved: boolean;
}

@ObjectType()
class UsageCostDTO {
  @Field(() => Float) totalCost: number;
  @Field(() => Int) totalRequests: number;
  @Field(() => Int) avgLatencyMs: number;
}

@ObjectType()
class PIILeakageDTO {
  @Field() logId: string;
  @Field() userId: string;
  @Field() provider: string;
  @Field() model: string;
}

@ObjectType()
class AIAuditEntryDTO {
  @Field() id: string;
  @Field() userId: string;
  @Field() action: string;
  @Field({ nullable: true }) resource?: string;
  @Field({ nullable: true }) details?: string;
  @Field({ nullable: true }) isFlagged?: boolean;
}

@InputType()
class LogUsageInput {
  @Field() userId: string;
  @Field({ nullable: true }) provider?: string;
  @Field() model: string;
  @Field(() => Int, { nullable: true }) inputTokens?: number;
  @Field(() => Int, { nullable: true }) outputTokens?: number;
  @Field(() => Float, { nullable: true }) cost?: number;
  @Field({ nullable: true }) feature?: string;
}

@InputType()
class ExecuteGovernanceInput {
  @Field() userId: string;
  @Field({ nullable: true }) provider?: string;
  @Field() model: string;
  @Field() inputText: string;
  @Field() feature: string;
}

@MetadataResolver()
@UseGuards(WorkspaceAuthGuard, UserAuthGuard)
export class AIGovernanceResolver {
  constructor(private readonly service: AIGovernanceService) {}

  @Mutation(() => AIUsageLogDTO)
  async logAIUsage(
    @AuthWorkspace() workspace: WorkspaceEntity,
    @Args('input') input: LogUsageInput,
  ) {
    return this.service.logUsage(workspace.id, input as unknown as Parameters<AIGovernanceService['logUsage']>[1]);
  }

  @Mutation(() => MaskPIIResultDTO)
  async maskPII(
    @AuthWorkspace() workspace: WorkspaceEntity,
    @Args('text') text: string,
  ) {
    return this.service.maskPII(workspace.id, text);
  }

  @Mutation(() => GovernanceResultDTO)
  async executeWithGovernance(
    @AuthWorkspace() workspace: WorkspaceEntity,
    @Args('input') input: ExecuteGovernanceInput,
  ) {
    return this.service.executeWithGovernance(workspace.id, input.userId, input as unknown as Parameters<AIGovernanceService['executeWithGovernance']>[2]);
  }

  @Query(() => [ModelConfigDTO])
  async getAIModelConfigs(@AuthWorkspace() workspace: WorkspaceEntity) {
    return this.service.getModelConfig(workspace.id);
  }

  @Query(() => UsageCostDTO)
  async getAIUsageCost(@AuthWorkspace() workspace: WorkspaceEntity) {
    return this.service.getUsageCost(workspace.id);
  }

  @Query(() => [PIILeakageDTO])
  async detectPIILeakage(@AuthWorkspace() workspace: WorkspaceEntity) {
    return this.service.detectPIILeakage(workspace.id);
  }

  @Query(() => [AIAuditEntryDTO])
  async getAIAuditTrail(
    @AuthWorkspace() workspace: WorkspaceEntity,
    @Args('flaggedOnly', { nullable: true }) flaggedOnly?: boolean,
  ) {
    return this.service.getAuditTrail(workspace.id, { flaggedOnly: flaggedOnly ?? undefined });
  }
}
