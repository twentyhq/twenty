import { UseGuards } from '@nestjs/common';
import { Args, Mutation, Query, Float, Int } from '@nestjs/graphql';
import { Field, ObjectType, InputType } from '@nestjs/graphql';

import { MetadataResolver } from 'src/engine/api/graphql/graphql-config/decorators/metadata-resolver.decorator';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import { WorkspaceAuthGuard } from 'src/engine/guards/workspace-auth.guard';
import { UserAuthGuard } from 'src/engine/guards/user-auth.guard';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';

import { CPQService } from './price-book.service';

// --- DTOs ---
@ObjectType()
class PriceBookDTO {
  @Field() id: string;
  @Field() name: string;
  @Field() isActive: boolean;
}

@ObjectType()
class ProductPricingDTO {
  @Field() id: string;
  @Field() priceBookId: string;
  @Field() productId: string;
  @Field(() => Float) unitPrice: number;
}

@ObjectType()
class QuoteDTO {
  @Field() id: string;
  @Field() name: string;
  @Field() status: string;
  @Field() opportunityId: string;
  @Field(() => Float, { nullable: true }) subtotal: number;
  @Field(() => Float, { nullable: true }) discount: number;
  @Field(() => Float, { nullable: true }) tax: number;
  @Field(() => Float, { nullable: true }) totalAmount: number;
}

@ObjectType()
class QuoteLineItemDTO {
  @Field() id: string;
  @Field() quoteId: string;
  @Field() productId: string;
  @Field(() => Int) quantity: number;
  @Field(() => Float) unitPrice: number;
  @Field(() => Float) discountRate: number;
  @Field(() => Float) discountAmount: number;
  @Field(() => Float) taxRate: number;
  @Field(() => Float) taxAmount: number;
  @Field(() => Float) lineTotal: number;
}

@InputType()
class AddLineItemInput {
  @Field() quoteId: string;
  @Field() productId: string;
  @Field(() => Int) quantity: number;
  @Field(() => Float) unitPrice: number;
  @Field({ nullable: true }) name?: string;
  @Field(() => Float, { nullable: true }) discountRate?: number;
  @Field(() => Float, { nullable: true }) taxRate?: number;
}

// --- Resolver ---
@MetadataResolver()
@UseGuards(WorkspaceAuthGuard, UserAuthGuard)
export class CPQResolver {
  constructor(private readonly cpqService: CPQService) {}

  @Mutation(() => PriceBookDTO)
  async createPriceBook(
    @AuthWorkspace() workspace: WorkspaceEntity,
    @Args('name') name: string,
  ) {
    return this.cpqService.createPriceBook(workspace.id, name);
  }

  @Mutation(() => ProductPricingDTO)
  async setProductPricing(
    @Args('priceBookId') priceBookId: string,
    @Args('productId') productId: string,
    @Args('unitPrice', { type: () => Float }) unitPrice: number,
  ) {
    return this.cpqService.setProductPricing(priceBookId, productId, unitPrice);
  }

  @Mutation(() => QuoteDTO)
  async createQuote(
    @AuthWorkspace() workspace: WorkspaceEntity,
    @Args('opportunityId') opportunityId: string,
    @Args('name') name: string,
  ) {
    return this.cpqService.createQuote(workspace.id, opportunityId, name);
  }

  @Mutation(() => QuoteLineItemDTO)
  async addLineItem(@Args('input') input: AddLineItemInput) {
    return this.cpqService.addLineItem(input.quoteId, input.productId, input.quantity, input.unitPrice, {
      name: input.name,
      discountRate: input.discountRate,
      taxRate: input.taxRate,
    });
  }

  @Query(() => [QuoteLineItemDTO])
  async quoteLineItems(@Args('quoteId') quoteId: string) {
    return this.cpqService.getLineItems(quoteId);
  }

  @Mutation(() => QuoteDTO)
  async calculateQuote(@Args('quoteId') quoteId: string) {
    return this.cpqService.calculateQuote(quoteId);
  }

  @Mutation(() => QuoteDTO)
  async finalizeQuote(@Args('quoteId') quoteId: string) {
    return this.cpqService.finalizeQuote(quoteId);
  }

  @Mutation(() => Boolean)
  async removeLineItem(
    @Args('quoteId') quoteId: string,
    @Args('lineItemId') lineItemId: string,
  ) {
    await this.cpqService.removeLineItem(quoteId, lineItemId);
    return true;
  }
}
