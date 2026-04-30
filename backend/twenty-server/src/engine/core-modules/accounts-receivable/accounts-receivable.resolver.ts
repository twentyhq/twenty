import { UseGuards, UsePipes } from '@nestjs/common';
import { Args, Mutation, Query, Float, Int } from '@nestjs/graphql';
import { Field, ObjectType, InputType, registerEnumType } from '@nestjs/graphql';

import { MetadataResolver } from 'src/engine/api/graphql/graphql-config/decorators/metadata-resolver.decorator';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import { WorkspaceAuthGuard } from 'src/engine/guards/workspace-auth.guard';
import { UserAuthGuard } from 'src/engine/guards/user-auth.guard';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { AccountsReceivableService } from './accounts-receivable.service';
import { CustomerPortalService } from './customer-portal.service';
import { PaymentMethod, InvoiceStatus } from './accounts-receivable.entity';

// --- DTOs ---
@ObjectType()
class InvoiceDTO {
  @Field() id: string;
  @Field() invoiceNumber: string;
  @Field() status: string;
  @Field(() => Float) totalAmount: number;
  @Field(() => Float) balanceDue: number;
  @Field() currency: string;
  @Field() dueDate: Date;
  @Field() createdAt: Date;
}

@ObjectType()
class AgingBucketDTO {
  @Field() bucket: string;
  @Field(() => Int) count: number;
  @Field(() => Float) total: number;
}

@ObjectType()
class ARMetricsDTO {
  @Field(() => Int) dso: number;
  @Field(() => Int) cei: number;
  @Field(() => [AgingBucketDTO]) aging: AgingBucketDTO[];
}

@ObjectType()
class CashForecastDTO {
  @Field() date: string;
  @Field(() => Float) expected: number;
}

@InputType()
class CreateInvoiceLineItemInput {
  @Field() description: string;
  @Field(() => Int) quantity: number;
  @Field(() => Float) unitPrice: number;
  @Field(() => Float) tax: number;
}

@InputType()
class CreateInvoiceInput {
  @Field() accountId: string;
  @Field() dealId: string;
  @Field({ nullable: true }) quoteId?: string;
  @Field(() => [CreateInvoiceLineItemInput]) lineItems: CreateInvoiceLineItemInput[];
  @Field({ nullable: true }) currency?: string;
  @Field(() => Int, { nullable: true }) paymentTermsDays?: number;
}

@InputType()
class ApplyPaymentInput {
  @Field() invoiceId: string;
  @Field(() => Float) amount: number;
  @Field() method: string;
  @Field({ nullable: true }) externalReference?: string;
}

@InputType()
class OpenDisputeInput {
  @Field() invoiceId: string;
  @Field() reason: string;
  @Field({ nullable: true }) description?: string;
  @Field(() => Float, { nullable: true }) disputedAmount?: number;
}

// --- Resolver ---
@MetadataResolver()
@UseGuards(WorkspaceAuthGuard, UserAuthGuard)
export class AccountsReceivableResolver {
  constructor(
    private readonly arService: AccountsReceivableService,
    private readonly portalService: CustomerPortalService,
  ) {}

  @Mutation(() => InvoiceDTO)
  async createInvoiceFromDeal(
    @AuthWorkspace() workspace: WorkspaceEntity,
    @Args('input') input: CreateInvoiceInput,
  ) {
    return this.arService.createInvoiceFromDeal(workspace.id, input);
  }

  @Mutation(() => InvoiceDTO)
  async sendInvoice(@Args('invoiceId') invoiceId: string) {
    return this.arService.sendInvoice(invoiceId);
  }

  @Mutation(() => Boolean)
  async applyPayment(
    @AuthWorkspace() workspace: WorkspaceEntity,
    @Args('input') input: ApplyPaymentInput,
  ) {
    await this.arService.applyPayment(workspace.id, input.invoiceId, input.amount, input.method as PaymentMethod, input.externalReference);
    return true;
  }

  @Mutation(() => Boolean)
  async openDispute(
    @AuthWorkspace() workspace: WorkspaceEntity,
    @Args('input') input: OpenDisputeInput,
  ) {
    await this.arService.openDispute(workspace.id, input.invoiceId, input);
    return true;
  }

  @Query(() => ARMetricsDTO)
  async arMetrics(@AuthWorkspace() workspace: WorkspaceEntity) {
    const dso = await this.arService.getDSO(workspace.id);
    const cei = await this.arService.getCollectionEffectiveness(workspace.id);
    const agingRaw = await this.arService.getAgingReport(workspace.id);
    const aging = Object.entries(agingRaw).map(([bucket, data]) => ({ bucket, ...data }));
    return { dso, cei, aging };
  }

  @Query(() => [CashForecastDTO])
  async cashForecast(
    @AuthWorkspace() workspace: WorkspaceEntity,
    @Args('days', { type: () => Int, defaultValue: 30 }) days: number,
  ) {
    return this.arService.getCashForecast(workspace.id, days);
  }

  @Mutation(() => Int)
  async markOverdueInvoices(@AuthWorkspace() workspace: WorkspaceEntity) {
    return this.arService.markOverdueInvoices(workspace.id);
  }

  @Mutation(() => Int)
  async applyLateFees(@AuthWorkspace() workspace: WorkspaceEntity) {
    return this.arService.applyLateFees(workspace.id);
  }
}
