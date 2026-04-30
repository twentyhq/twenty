import { UseGuards } from '@nestjs/common';
import { Args, Mutation, Query, Float, Int } from '@nestjs/graphql';
import { Field, ObjectType, InputType } from '@nestjs/graphql';

import { MetadataResolver } from 'src/engine/api/graphql/graphql-config/decorators/metadata-resolver.decorator';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import { WorkspaceAuthGuard } from 'src/engine/guards/workspace-auth.guard';
import { UserAuthGuard } from 'src/engine/guards/user-auth.guard';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { InventoryService } from './inventory.service';

// --- DTOs ---
@ObjectType()
class WarehouseDTO {
  @Field() id: string;
  @Field() name: string;
  @Field({ nullable: true }) address?: string;
}

@ObjectType()
class ProductStockDTO {
  @Field() id: string;
  @Field() productId: string;
  @Field() warehouseId: string;
  @Field(() => Int) quantityOnHand: number;
  @Field(() => Int) quantityAvailable: number;
  @Field(() => Int) quantityReserved: number;
  @Field(() => Float, { nullable: true }) unitCost?: number;
}

@ObjectType()
class StockValuationItemDTO {
  @Field() productId: string;
  @Field(() => Int) quantity: number;
  @Field(() => Float) value: number;
}

@ObjectType()
class StockValuationDTO {
  @Field(() => Float) totalValue: number;
  @Field(() => [StockValuationItemDTO]) items: StockValuationItemDTO[];
}

@ObjectType()
class SupplierDTO {
  @Field() id: string;
  @Field() name: string;
  @Field({ nullable: true }) contactEmail?: string;
}

@InputType()
class CreateSupplierInput {
  @Field() name: string;
  @Field({ nullable: true }) contactEmail?: string;
  @Field({ nullable: true }) contactPhone?: string;
}

// --- Resolver ---
@MetadataResolver()
@UseGuards(WorkspaceAuthGuard, UserAuthGuard)
export class InventoryResolver {
  constructor(private readonly service: InventoryService) {}

  @Mutation(() => WarehouseDTO)
  async createWarehouse(
    @AuthWorkspace() workspace: WorkspaceEntity,
    @Args('name') name: string,
    @Args('address', { nullable: true }) address?: string,
  ) {
    return this.service.createWarehouse(workspace.id, name, address);
  }

  @Mutation(() => ProductStockDTO)
  async addStock(
    @AuthWorkspace() workspace: WorkspaceEntity,
    @Args('productId') productId: string,
    @Args('warehouseId') warehouseId: string,
    @Args('quantity', { type: () => Int }) quantity: number,
    @Args('unitCost', { type: () => Float, nullable: true }) unitCost?: number,
  ) {
    return this.service.addStock(workspace.id, productId, warehouseId, quantity, unitCost);
  }

  @Mutation(() => ProductStockDTO)
  async reserveStock(
    @AuthWorkspace() workspace: WorkspaceEntity,
    @Args('productId') productId: string,
    @Args('warehouseId') warehouseId: string,
    @Args('quantity', { type: () => Int }) quantity: number,
    @Args('dealId', { nullable: true }) dealId?: string,
  ) {
    return this.service.reserveStock(workspace.id, productId, warehouseId, quantity, dealId);
  }

  @Mutation(() => ProductStockDTO)
  async releaseStock(
    @AuthWorkspace() workspace: WorkspaceEntity,
    @Args('productId') productId: string,
    @Args('warehouseId') warehouseId: string,
    @Args('quantity', { type: () => Int }) quantity: number,
  ) {
    return this.service.releaseStock(workspace.id, productId, warehouseId, quantity);
  }

  @Mutation(() => Boolean)
  async transferStock(
    @AuthWorkspace() workspace: WorkspaceEntity,
    @Args('productId') productId: string,
    @Args('fromWarehouseId') fromWarehouseId: string,
    @Args('toWarehouseId') toWarehouseId: string,
    @Args('quantity', { type: () => Int }) quantity: number,
  ) {
    await this.service.transferStock(workspace.id, productId, fromWarehouseId, toWarehouseId, quantity);
    return true;
  }

  @Query(() => [ProductStockDTO])
  async getLowStockAlerts(@AuthWorkspace() workspace: WorkspaceEntity) {
    return this.service.getLowStockAlerts(workspace.id);
  }

  @Query(() => StockValuationDTO)
  async getStockValuation(@AuthWorkspace() workspace: WorkspaceEntity) {
    return this.service.getStockValuation(workspace.id);
  }

  @Mutation(() => SupplierDTO)
  async createSupplier(
    @AuthWorkspace() workspace: WorkspaceEntity,
    @Args('input') input: CreateSupplierInput,
  ) {
    return this.service.createSupplier(workspace.id, input);
  }
}
