import { UseGuards } from '@nestjs/common';
import { Args, Mutation, Query, Float, Int } from '@nestjs/graphql';
import { Field, ObjectType, InputType } from '@nestjs/graphql';

import { MetadataResolver } from 'src/engine/api/graphql/graphql-config/decorators/metadata-resolver.decorator';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import { WorkspaceAuthGuard } from 'src/engine/guards/workspace-auth.guard';
import { UserAuthGuard } from 'src/engine/guards/user-auth.guard';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { ECommerceService } from './ecommerce.service';

// --- DTOs ---
@ObjectType()
class ECommerceProductDTO {
  @Field() id: string;
  @Field({ nullable: true }) name?: string;
  @Field({ nullable: true }) sku?: string;
  @Field(() => Float, { nullable: true }) basePrice?: number;
  @Field({ nullable: true }) isActive?: boolean;
}

@ObjectType()
class ECommerceOrderDTO {
  @Field() id: string;
  @Field({ nullable: true }) orderNumber?: string;
  @Field({ nullable: true }) status?: string;
  @Field(() => Float, { nullable: true }) totalAmount?: number;
  @Field(() => Int, { nullable: true }) loyaltyPointsEarned?: number;
}

@ObjectType()
class AbandonedCartDTO {
  @Field() id: string;
  @Field({ nullable: true }) contactId?: string;
  @Field(() => Float, { nullable: true }) cartValue?: number;
  @Field({ nullable: true }) status?: string;
  @Field({ nullable: true }) recoveryLink?: string;
}

@ObjectType()
class LoyaltyMemberDTO {
  @Field() id: string;
  @Field({ nullable: true }) contactId?: string;
  @Field(() => Int) totalPoints: number;
  @Field(() => Int) availablePoints: number;
  @Field({ nullable: true }) tier?: string;
  @Field(() => Float, { nullable: true }) predictedCLV?: number;
}

@ObjectType()
class CohortRetentionDTO {
  @Field() cohort: string;
  @Field(() => Int) month1: number;
  @Field(() => Int) month2: number;
  @Field(() => Int) month3: number;
  @Field(() => Int) month4: number;
}

@ObjectType()
class TopProductDTO {
  @Field() name: string;
  @Field(() => Int) sold: number;
  @Field(() => Float) revenue: number;
}

@ObjectType()
class ECommerceAnalyticsDTO {
  @Field(() => Int) totalOrders: number;
  @Field(() => Float) totalRevenue: number;
  @Field(() => Float) avgOrderValue: number;
  @Field(() => Int) cartAbandonmentRate: number;
  @Field(() => Int) recoveryRate: number;
  @Field(() => Float) subscriptionMRR: number;
  @Field(() => Int) loyaltyMembers: number;
  @Field(() => [TopProductDTO]) topProducts: TopProductDTO[];
}

@InputType()
class CreateProductInput {
  @Field() name: string;
  @Field({ nullable: true }) sku?: string;
  @Field(() => Float) basePrice: number;
  @Field({ nullable: true }) category?: string;
}

@InputType()
class OrderItemInput {
  @Field() productId: string;
  @Field(() => Int) quantity: number;
  @Field(() => Float) unitPrice: number;
  @Field(() => Float) total: number;
}

@InputType()
class CreateOrderInput {
  @Field({ nullable: true }) contactId?: string;
  @Field({ nullable: true }) accountId?: string;
  @Field(() => [OrderItemInput]) items: OrderItemInput[];
  @Field(() => Float, { nullable: true }) taxAmount?: number;
  @Field(() => Float, { nullable: true }) shippingCost?: number;
  @Field(() => Float, { nullable: true }) discountAmount?: number;
  @Field({ nullable: true }) source?: string;
}

@InputType()
class ReturnItemInput {
  @Field() productId: string;
  @Field(() => Int) quantity: number;
  @Field() reason: string;
}

@InputType()
class TrackAbandonedCartInput {
  @Field({ nullable: true }) contactId?: string;
  @Field(() => Float, { nullable: true }) cartValue?: number;
}

// --- Resolver ---
@MetadataResolver()
@UseGuards(WorkspaceAuthGuard, UserAuthGuard)
export class ECommerceResolver {
  constructor(private readonly service: ECommerceService) {}

  @Mutation(() => ECommerceProductDTO)
  async createProduct(
    @AuthWorkspace() workspace: WorkspaceEntity,
    @Args('input') input: CreateProductInput,
  ) {
    return this.service.createProduct(workspace.id, input);
  }

  @Query(() => Float)
  async getDynamicPrice(
    @AuthWorkspace() workspace: WorkspaceEntity,
    @Args('productId') productId: string,
    @Args('segment', { nullable: true }) segment?: string,
    @Args('quantity', { type: () => Int, nullable: true }) quantity?: number,
  ) {
    return this.service.getDynamicPrice(productId, segment, quantity);
  }

  @Mutation(() => ECommerceOrderDTO)
  async createOrder(
    @AuthWorkspace() workspace: WorkspaceEntity,
    @Args('input') input: CreateOrderInput,
  ) {
    return this.service.createOrder(workspace.id, input as any);
  }

  @Mutation(() => ECommerceOrderDTO)
  async processReturn(
    @AuthWorkspace() workspace: WorkspaceEntity,
    @Args('orderId') orderId: string,
    @Args('items', { type: () => [ReturnItemInput] }) items: ReturnItemInput[],
  ) {
    return this.service.processReturn(orderId, items);
  }

  @Mutation(() => AbandonedCartDTO)
  async trackAbandonedCart(
    @AuthWorkspace() workspace: WorkspaceEntity,
    @Args('input') input: TrackAbandonedCartInput,
  ) {
    return this.service.trackAbandonedCart(workspace.id, input);
  }

  @Query(() => [ECommerceProductDTO])
  async getAIRecommendations(
    @AuthWorkspace() workspace: WorkspaceEntity,
    @Args('contactId') contactId: string,
    @Args('limit', { type: () => Int, defaultValue: 5 }) limit: number,
  ) {
    return this.service.getAIRecommendations(workspace.id, contactId, limit);
  }

  @Mutation(() => LoyaltyMemberDTO)
  async addLoyaltyPoints(
    @AuthWorkspace() workspace: WorkspaceEntity,
    @Args('contactId') contactId: string,
    @Args('points', { type: () => Int }) points: number,
    @Args('orderValue', { type: () => Float }) orderValue: number,
  ) {
    return this.service.addLoyaltyPoints(workspace.id, contactId, points, orderValue);
  }

  @Query(() => [CohortRetentionDTO])
  async getCohortRetention(@AuthWorkspace() workspace: WorkspaceEntity) {
    return this.service.getCohortRetention(workspace.id);
  }

  @Query(() => ECommerceAnalyticsDTO)
  async getECommerceAnalytics(@AuthWorkspace() workspace: WorkspaceEntity) {
    return this.service.getECommerceAnalytics(workspace.id);
  }
}
