import { UseGuards } from '@nestjs/common';
import { Args, Mutation, Query, Float, Int } from '@nestjs/graphql';
import { Field, ObjectType, InputType } from '@nestjs/graphql';

import { MetadataResolver } from 'src/engine/api/graphql/graphql-config/decorators/metadata-resolver.decorator';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import { WorkspaceAuthGuard } from 'src/engine/guards/workspace-auth.guard';
import { UserAuthGuard } from 'src/engine/guards/user-auth.guard';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { ProcurementService } from './procurement.service';

// --- DTOs ---
@ObjectType()
class PurchaseRequestDTO {
  @Field() id: string;
  @Field({ nullable: true }) status?: string;
  @Field(() => Float, { nullable: true }) estimatedAmount?: number;
  @Field({ nullable: true }) category?: string;
}

@ObjectType()
class RFQDTO {
  @Field() id: string;
  @Field({ nullable: true }) status?: string;
  @Field({ nullable: true }) selectedSupplierId?: string;
}

@ObjectType()
class RFQComparisonDTO {
  @Field() supplierId: string;
  @Field(() => Float) totalPrice: number;
  @Field(() => Int) leadTimeDays: number;
  @Field(() => Int) score: number;
}

@ObjectType()
class SpendByCategoryDTO {
  @Field() category: string;
  @Field(() => Float) amount: number;
}

@InputType()
class CreatePRInput {
  @Field({ nullable: true }) title?: string;
  @Field({ nullable: true }) description?: string;
  @Field({ nullable: true }) category?: string;
  @Field({ nullable: true }) requestorId?: string;
}

// --- Resolver ---
@MetadataResolver()
@UseGuards(WorkspaceAuthGuard, UserAuthGuard)
export class ProcurementResolver {
  constructor(private readonly service: ProcurementService) {}

  @Mutation(() => PurchaseRequestDTO)
  async createPR(
    @AuthWorkspace() workspace: WorkspaceEntity,
    @Args('input') input: CreatePRInput,
  ) {
    return this.service.createPR(workspace.id, input);
  }

  @Mutation(() => PurchaseRequestDTO)
  async approvePR(
    @AuthWorkspace() workspace: WorkspaceEntity,
    @Args('prId') prId: string,
    @Args('approverId') approverId: string,
  ) {
    return this.service.approvePR(prId, approverId);
  }

  @Mutation(() => RFQDTO)
  async createRFQ(
    @AuthWorkspace() workspace: WorkspaceEntity,
    @Args('purchaseRequestId') purchaseRequestId: string,
    @Args('supplierIds', { type: () => [String] }) supplierIds: string[],
    @Args('deadline') deadline: Date,
  ) {
    return this.service.createRFQ(workspace.id, purchaseRequestId, supplierIds, deadline);
  }

  @Mutation(() => RFQDTO)
  async submitRFQResponse(
    @AuthWorkspace() workspace: WorkspaceEntity,
    @Args('rfqId') rfqId: string,
    @Args('supplierId') supplierId: string,
    @Args('totalPrice', { type: () => Float }) totalPrice: number,
    @Args('leadTimeDays', { type: () => Int }) leadTimeDays: number,
    @Args('terms') terms: string,
  ) {
    return this.service.submitRFQResponse(rfqId, supplierId, totalPrice, leadTimeDays, terms);
  }

  @Query(() => [RFQComparisonDTO])
  async compareRFQResponses(
    @AuthWorkspace() workspace: WorkspaceEntity,
    @Args('rfqId') rfqId: string,
  ) {
    return this.service.compareRFQResponses(rfqId);
  }

  @Query(() => [SpendByCategoryDTO])
  async getSpendByCategory(@AuthWorkspace() workspace: WorkspaceEntity) {
    const spend = await this.service.getSpendByCategory(workspace.id);
    return Object.entries(spend).map(([category, amount]) => ({ category, amount }));
  }
}
