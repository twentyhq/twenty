import { UseGuards } from '@nestjs/common';
import { Args, Mutation, Query, Float, Int } from '@nestjs/graphql';
import { Field, ObjectType, InputType } from '@nestjs/graphql';

import { MetadataResolver } from 'src/engine/api/graphql/graphql-config/decorators/metadata-resolver.decorator';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import { WorkspaceAuthGuard } from 'src/engine/guards/workspace-auth.guard';
import { UserAuthGuard } from 'src/engine/guards/user-auth.guard';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';

import { ABMService } from './target-account.service';

// --- DTOs ---
@ObjectType()
class TargetAccountDTO {
  @Field() id: string;
  @Field() companyId: string;
  @Field() companyName: string;
  @Field() tier: string;
  @Field() status: string;
  @Field(() => Float, { nullable: true }) totalRevenue: number;
  @Field(() => Int, { nullable: true }) opportunityCount: number;
}

@ObjectType()
class ABMCampaignDTO {
  @Field() id: string;
  @Field() name: string;
  @Field({ nullable: true }) targetTier: string;
  @Field() isActive: boolean;
  @Field(() => Int, { nullable: true }) enrolledCount: number;
}

@ObjectType()
class TargetAccountSummaryDTO {
  @Field(() => Int) accounts: number;
  @Field(() => Int) activeAccounts: number;
  @Field(() => Float) totalRevenue: number;
  @Field(() => Int) opportunityCount: number;
  @Field(() => Int) averageEngagementScore: number;
}

@InputType()
class AddTargetAccountInput {
  @Field() companyId: string;
  @Field() companyName: string;
  @Field({ nullable: true }) tier?: string;
}

@InputType()
class AddKeyContactInput {
  @Field() accountId: string;
  @Field() contactId: string;
  @Field() contactName: string;
  @Field() role: string;
}

@InputType()
class RecordEngagementInput {
  @Field() accountId: string;
  @Field() type: string;
  @Field(() => Float, { nullable: true }) value?: number;
  @Field({ nullable: true }) notes?: string;
}

// --- Resolver ---
@MetadataResolver()
@UseGuards(WorkspaceAuthGuard, UserAuthGuard)
export class ABMResolver {
  constructor(private readonly abmService: ABMService) {}

  @Query(() => [TargetAccountDTO])
  async targetAccounts(@AuthWorkspace() workspace: WorkspaceEntity) {
    return this.abmService.getTargetAccounts(workspace.id);
  }

  @Query(() => TargetAccountSummaryDTO)
  async targetAccountSummary(@AuthWorkspace() workspace: WorkspaceEntity) {
    return this.abmService.getTargetAccountSummary(workspace.id);
  }

  @Mutation(() => TargetAccountDTO)
  async addTargetAccount(
    @AuthWorkspace() workspace: WorkspaceEntity,
    @Args('input') input: AddTargetAccountInput,
  ) {
    return this.abmService.addTargetAccount(workspace.id, input.companyId, input.companyName, input.tier as any);
  }

  @Mutation(() => TargetAccountDTO)
  async updateAccountTier(
    @Args('accountId') accountId: string,
    @Args('tier') tier: string,
  ) {
    return this.abmService.updateAccountTier(accountId, tier as any);
  }

  @Mutation(() => TargetAccountDTO)
  async addKeyContact(@Args('input') input: AddKeyContactInput) {
    return this.abmService.addKeyContact(input.accountId, {
      id: input.contactId,
      name: input.contactName,
      role: input.role,
    });
  }

  @Mutation(() => TargetAccountDTO)
  async setDecisionMakers(
    @Args('accountId') accountId: string,
    @Args('decisionMakers', { type: () => [String] }) decisionMakers: string[],
  ) {
    return this.abmService.setDecisionMakers(accountId, decisionMakers);
  }

  @Mutation(() => TargetAccountDTO)
  async recordEngagement(@Args('input') input: RecordEngagementInput) {
    return this.abmService.recordEngagement(input.accountId, {
      type: input.type,
      value: input.value,
      notes: input.notes,
    });
  }

  @Query(() => Int)
  async engagementScore(@Args('accountId') accountId: string) {
    return this.abmService.computeEngagementScore(accountId);
  }

  // Campaigns
  @Query(() => [ABMCampaignDTO])
  async abmCampaigns(@AuthWorkspace() workspace: WorkspaceEntity) {
    return this.abmService.getCampaigns(workspace.id);
  }

  @Mutation(() => ABMCampaignDTO)
  async createABMCampaign(
    @AuthWorkspace() workspace: WorkspaceEntity,
    @Args('name') name: string,
    @Args('targetTier', { nullable: true }) targetTier?: string,
  ) {
    return this.abmService.createCampaign(workspace.id, name, targetTier as any);
  }

  @Mutation(() => Boolean)
  async enrollAccountsInCampaign(
    @Args('campaignId') campaignId: string,
    @Args('accountIds', { type: () => [String] }) accountIds: string[],
  ) {
    await this.abmService.enrollAccounts(campaignId, accountIds);
    return true;
  }
}
