import { UseGuards } from '@nestjs/common';
import { Args, Mutation, Query, Float, Int } from '@nestjs/graphql';
import { Field, ObjectType, InputType } from '@nestjs/graphql';

import { MetadataResolver } from 'src/engine/api/graphql/graphql-config/decorators/metadata-resolver.decorator';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import { WorkspaceAuthGuard } from 'src/engine/guards/workspace-auth.guard';
import { UserAuthGuard } from 'src/engine/guards/user-auth.guard';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { TradeImportService } from './trade-import.service';

// --- DTOs ---
@ObjectType()
class PurchaseOrderDTO {
  @Field() id: string;
  @Field({ nullable: true }) poNumber?: string;
  @Field({ nullable: true }) status?: string;
  @Field(() => Float, { nullable: true }) totalAmount?: number;
}

@ObjectType()
class ShipmentDTO {
  @Field() id: string;
  @Field({ nullable: true }) status?: string;
  @Field({ nullable: true }) carrier?: string;
  @Field({ nullable: true }) eta?: Date;
}

@ObjectType()
class LandedCostDTO {
  @Field() id: string;
  @Field(() => Float) totalLandedCost: number;
  @Field(() => Float) unitLandedCost: number;
}

@ObjectType()
class TradeAnalyticsDTO {
  @Field(() => Int) totalPOs: number;
  @Field(() => Int) inTransit: number;
  @Field(() => Int) avgTransitDays: number;
  @Field(() => Float) totalLandedCost: number;
  @Field(() => Float) totalDutiesPaid: number;
}

@ObjectType()
class OCRResultDTO {
  @Field() field: string;
  @Field() value: string;
}

@ObjectType()
class CarbonFootprintDTO {
  @Field(() => Float) carbonKg: number;
  @Field() method: string;
  @Field(() => Float) distanceKm: number;
}

@InputType()
class CreatePOInput {
  @Field({ nullable: true }) supplierId?: string;
  @Field({ nullable: true }) currency?: string;
  @Field({ nullable: true }) expectedDeliveryDate?: Date;
}

@InputType()
class CreateShipmentInput {
  @Field({ nullable: true }) purchaseOrderId?: string;
  @Field({ nullable: true }) carrier?: string;
  @Field({ nullable: true }) portOfOrigin?: string;
  @Field({ nullable: true }) portOfDestination?: string;
  @Field({ nullable: true }) eta?: Date;
  @Field({ nullable: true }) etd?: Date;
}

@InputType()
class CalculateLandedCostInput {
  @Field() purchaseOrderId: string;
  @Field() productId: string;
  @Field(() => Float) productValue: number;
  @Field(() => Int) quantity: number;
  @Field(() => Float, { nullable: true }) freight?: number;
  @Field(() => Float, { nullable: true }) insurance?: number;
  @Field(() => Float, { nullable: true }) duties?: number;
  @Field(() => Float, { nullable: true }) vat?: number;
  @Field(() => Float, { nullable: true }) agentFees?: number;
  @Field(() => Float, { nullable: true }) otherCosts?: number;
}

// --- Resolver ---
@MetadataResolver()
@UseGuards(WorkspaceAuthGuard, UserAuthGuard)
export class TradeImportResolver {
  constructor(private readonly service: TradeImportService) {}

  @Mutation(() => PurchaseOrderDTO)
  async createPO(
    @AuthWorkspace() workspace: WorkspaceEntity,
    @Args('input') input: CreatePOInput,
  ) {
    return this.service.createPO(workspace.id, input);
  }

  @Mutation(() => ShipmentDTO)
  async createShipment(
    @AuthWorkspace() workspace: WorkspaceEntity,
    @Args('input') input: CreateShipmentInput,
  ) {
    return this.service.createShipment(workspace.id, input);
  }

  @Mutation(() => LandedCostDTO)
  async calculateLandedCost(
    @AuthWorkspace() workspace: WorkspaceEntity,
    @Args('input') input: CalculateLandedCostInput,
  ) {
    return this.service.calculateLandedCost(
      workspace.id, input.purchaseOrderId, input.productId,
      {
        productValue: input.productValue, quantity: input.quantity,
        freight: input.freight, insurance: input.insurance,
        duties: input.duties, vat: input.vat,
        agentFees: input.agentFees, otherCosts: input.otherCosts,
      },
    );
  }

  @Query(() => TradeAnalyticsDTO)
  async getTradeAnalytics(@AuthWorkspace() workspace: WorkspaceEntity) {
    return this.service.getTradeAnalytics(workspace.id);
  }

  @Mutation(() => [OCRResultDTO])
  async processDocumentOCR(
    @AuthWorkspace() workspace: WorkspaceEntity,
    @Args('shipmentId') shipmentId: string,
    @Args('documentType') documentType: string,
    @Args('fileContent') fileContent: string,
  ) {
    const result = await this.service.processDocumentOCR(workspace.id, shipmentId, documentType, fileContent);
    return Object.entries(result).map(([field, value]) => ({ field, value }));
  }

  @Query(() => CarbonFootprintDTO)
  async calculateCarbonFootprint(
    @AuthWorkspace() workspace: WorkspaceEntity,
    @Args('shipmentId') shipmentId: string,
  ) {
    return this.service.calculateCarbonFootprint(shipmentId);
  }
}
