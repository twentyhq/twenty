import { UseGuards } from '@nestjs/common';
import { Args, Mutation, Query, Float, Int } from '@nestjs/graphql';
import { Field, ObjectType, InputType } from '@nestjs/graphql';

import { MetadataResolver } from 'src/engine/api/graphql/graphql-config/decorators/metadata-resolver.decorator';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import { WorkspaceAuthGuard } from 'src/engine/guards/workspace-auth.guard';
import { UserAuthGuard } from 'src/engine/guards/user-auth.guard';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { AccountingIntegrationService } from './accounting-integration.service';

// --- DTOs ---
@ObjectType()
class AccountingConnectionDTO {
  @Field() id: string;
  @Field({ nullable: true }) provider?: string;
  @Field({ nullable: true }) status?: string;
}

@ObjectType()
class TaxCalculationDTO {
  @Field(() => Float) tax: number;
  @Field(() => Float) withholding: number;
  @Field(() => Float) net: number;
}

@ObjectType()
class RevenueScheduleDTO {
  @Field() id: string;
  @Field() dealId: string;
  @Field(() => Float) totalAmount: number;
  @Field(() => Float) recognized: number;
  @Field(() => Float) deferred: number;
  @Field({ nullable: true }) recognitionType?: string;
}

@ObjectType()
class CommissionDTO {
  @Field() id: string;
  @Field() repId: string;
  @Field() dealId: string;
  @Field(() => Float) dealAmount: number;
  @Field(() => Float) commissionRate: number;
  @Field(() => Float) commissionAmount: number;
}

@ObjectType()
class PLByClientDTO {
  @Field() accountId: string;
  @Field(() => Float) revenue: number;
  @Field(() => Float) commissions: number;
  @Field(() => Float) margin: number;
}

@InputType()
class CreateConnectionInput {
  @Field({ nullable: true }) provider?: string;
  @Field({ nullable: true }) apiKey?: string;
  @Field({ nullable: true }) name?: string;
}

// --- Resolver ---
@MetadataResolver()
@UseGuards(WorkspaceAuthGuard, UserAuthGuard)
export class AccountingIntegrationResolver {
  constructor(private readonly service: AccountingIntegrationService) {}

  @Mutation(() => AccountingConnectionDTO)
  async createAccountingConnection(
    @AuthWorkspace() workspace: WorkspaceEntity,
    @Args('input') input: CreateConnectionInput,
  ) {
    return this.service.createConnection(workspace.id, input as any);
  }

  @Query(() => TaxCalculationDTO)
  async calculateTax(
    @AuthWorkspace() workspace: WorkspaceEntity,
    @Args('amount', { type: () => Float }) amount: number,
    @Args('country') country: string,
  ) {
    return this.service.calculateTax(workspace.id, amount, country);
  }

  @Mutation(() => RevenueScheduleDTO)
  async createRevenueSchedule(
    @AuthWorkspace() workspace: WorkspaceEntity,
    @Args('dealId') dealId: string,
    @Args('totalAmount', { type: () => Float }) totalAmount: number,
    @Args('type') type: string,
    @Args('deferralMonths', { type: () => Int, nullable: true }) deferralMonths?: number,
  ) {
    return this.service.createRevenueSchedule(workspace.id, dealId, totalAmount, type, deferralMonths);
  }

  @Mutation(() => CommissionDTO)
  async calculateCommission(
    @AuthWorkspace() workspace: WorkspaceEntity,
    @Args('repId') repId: string,
    @Args('dealId') dealId: string,
    @Args('dealAmount', { type: () => Float }) dealAmount: number,
    @Args('commissionRate', { type: () => Float }) commissionRate: number,
  ) {
    return this.service.calculateCommission(workspace.id, repId, dealId, dealAmount, commissionRate);
  }

  @Query(() => [PLByClientDTO])
  async getPLByClient(@AuthWorkspace() workspace: WorkspaceEntity) {
    return this.service.getPLByClient(workspace.id);
  }
}
