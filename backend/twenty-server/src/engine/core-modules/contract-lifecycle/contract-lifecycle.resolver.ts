import { UseGuards } from '@nestjs/common';
import { Args, Mutation, Query, Float, Int } from '@nestjs/graphql';
import { Field, ObjectType, InputType } from '@nestjs/graphql';

import { MetadataResolver } from 'src/engine/api/graphql/graphql-config/decorators/metadata-resolver.decorator';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import { WorkspaceAuthGuard } from 'src/engine/guards/workspace-auth.guard';
import { UserAuthGuard } from 'src/engine/guards/user-auth.guard';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { ContractLifecycleService } from './contract-lifecycle.service';

// --- DTOs ---
@ObjectType()
class CLMContractDTO {
  @Field() id: string;
  @Field({ nullable: true }) status?: string;
  @Field({ nullable: true }) dealId?: string;
  @Field(() => Float, { nullable: true }) totalValue?: number;
  @Field(() => Int, { nullable: true }) version?: number;
  @Field({ nullable: true }) endDate?: Date;
}

@ObjectType()
class RiskScoreDTO {
  @Field(() => Int) score: number;
  @Field(() => [String]) flags: string[];
}

@ObjectType()
class CLMAnalyticsDTO {
  @Field(() => Int) active: number;
  @Field(() => Int) expiring30: number;
  @Field(() => Float) totalValue: number;
  @Field(() => Int) avgRisk: number;
}

@InputType()
class CreateContractFromDealInput {
  @Field() dealId: string;
  @Field() templateId: string;
  @Field({ nullable: true }) title?: string;
  @Field(() => Float, { nullable: true }) totalValue?: number;
  @Field({ nullable: true }) startDate?: Date;
  @Field({ nullable: true }) endDate?: Date;
}

@InputType()
class ApprovalChainStepInput {
  @Field() role: string;
  @Field() userId: string;
}

// --- Resolver ---
@MetadataResolver()
@UseGuards(WorkspaceAuthGuard, UserAuthGuard)
export class ContractLifecycleResolver {
  constructor(private readonly service: ContractLifecycleService) {}

  @Mutation(() => CLMContractDTO)
  async createContractFromDeal(
    @AuthWorkspace() workspace: WorkspaceEntity,
    @Args('input') input: CreateContractFromDealInput,
  ) {
    return this.service.createFromDeal(workspace.id, input.dealId, input.templateId, input);
  }

  @Mutation(() => CLMContractDTO)
  async submitContractForApproval(
    @AuthWorkspace() workspace: WorkspaceEntity,
    @Args('contractId') contractId: string,
    @Args('chain', { type: () => [ApprovalChainStepInput] }) chain: ApprovalChainStepInput[],
  ) {
    return this.service.submitForApproval(contractId, chain);
  }

  @Mutation(() => CLMContractDTO)
  async approveContractStep(
    @AuthWorkspace() workspace: WorkspaceEntity,
    @Args('contractId') contractId: string,
    @Args('userId') userId: string,
  ) {
    return this.service.approveStep(contractId, userId);
  }

  @Mutation(() => CLMContractDTO)
  async signContract(
    @AuthWorkspace() workspace: WorkspaceEntity,
    @Args('contractId') contractId: string,
    @Args('signerId') signerId: string,
    @Args('ip') ip: string,
  ) {
    return this.service.signContract(contractId, signerId, ip);
  }

  @Query(() => RiskScoreDTO)
  async scoreContractRisk(
    @AuthWorkspace() workspace: WorkspaceEntity,
    @Args('contractId') contractId: string,
  ) {
    return this.service.scoreRisk(contractId);
  }

  @Query(() => [CLMContractDTO])
  async getExpiringContracts(
    @AuthWorkspace() workspace: WorkspaceEntity,
    @Args('withinDays', { type: () => Int, defaultValue: 30 }) withinDays: number,
  ) {
    return this.service.getExpiringContracts(workspace.id, withinDays);
  }

  @Query(() => CLMAnalyticsDTO)
  async getContractAnalytics(@AuthWorkspace() workspace: WorkspaceEntity) {
    return this.service.getAnalytics(workspace.id);
  }
}
