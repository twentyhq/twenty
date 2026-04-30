import { UseGuards } from '@nestjs/common';
import { Args, Mutation, Query, Float } from '@nestjs/graphql';
import { Field, ObjectType, InputType } from '@nestjs/graphql';

import { MetadataResolver } from 'src/engine/api/graphql/graphql-config/decorators/metadata-resolver.decorator';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import { WorkspaceAuthGuard } from 'src/engine/guards/workspace-auth.guard';
import { UserAuthGuard } from 'src/engine/guards/user-auth.guard';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { FintechService } from './fintech.service';

// --- DTOs ---
@ObjectType()
class PaymentLinkDTO {
  @Field() id: string;
  @Field({ nullable: true }) paymentLink?: string;
  @Field({ nullable: true }) status?: string;
  @Field(() => Float) amount: number;
  @Field({ nullable: true }) currency?: string;
  @Field({ nullable: true }) gateway?: string;
}

@ObjectType()
class ElectronicInvoiceDTO {
  @Field() id: string;
  @Field({ nullable: true }) status?: string;
  @Field({ nullable: true }) cufe?: string;
  @Field({ nullable: true }) pdfUrl?: string;
  @Field({ nullable: true }) provider?: string;
}

@ObjectType()
class PartnerChannelDTO {
  @Field() id: string;
  @Field({ nullable: true }) name?: string;
  @Field(() => Float, { nullable: true }) totalRevenue?: number;
  @Field(() => Float, { nullable: true }) commissionRate?: number;
}

@ObjectType()
class ReconciliationDTO {
  @Field() id: string;
  @Field({ nullable: true }) status?: string;
  @Field(() => Float) amount: number;
  @Field({ nullable: true }) source?: string;
}

@InputType()
class CreatePaymentLinkInput {
  @Field() quoteId: string;
  @Field() dealId: string;
  @Field(() => Float) amount: number;
  @Field() gateway: string;
  @Field({ nullable: true }) currency?: string;
}

@InputType()
class SubmitElectronicInvoiceInput {
  @Field() invoiceId: string;
  @Field() provider: string;
  @Field() xmlContent: string;
}

@InputType()
class CreatePartnerInput {
  @Field({ nullable: true }) name?: string;
  @Field(() => Float, { nullable: true }) commissionRate?: number;
}

@InputType()
class ReconcilePaymentInput {
  @Field() paymentId: string;
  @Field() dealId: string;
  @Field() invoiceId: string;
  @Field(() => Float) amount: number;
  @Field() source: string;
}

// --- Resolver ---
@MetadataResolver()
@UseGuards(WorkspaceAuthGuard, UserAuthGuard)
export class FintechResolver {
  constructor(private readonly service: FintechService) {}

  @Mutation(() => PaymentLinkDTO)
  async createPaymentLink(
    @AuthWorkspace() workspace: WorkspaceEntity,
    @Args('input') input: CreatePaymentLinkInput,
  ) {
    return this.service.createPaymentLink(
      workspace.id, input.quoteId, input.dealId,
      input.amount, input.gateway as any, input.currency,
    );
  }

  @Mutation(() => ElectronicInvoiceDTO)
  async submitElectronicInvoice(
    @AuthWorkspace() workspace: WorkspaceEntity,
    @Args('input') input: SubmitElectronicInvoiceInput,
  ) {
    return this.service.submitElectronicInvoice(
      workspace.id, input.invoiceId, input.provider as any, input.xmlContent,
    );
  }

  @Mutation(() => PartnerChannelDTO)
  async createFintechPartner(
    @AuthWorkspace() workspace: WorkspaceEntity,
    @Args('input') input: CreatePartnerInput,
  ) {
    return this.service.createPartner(workspace.id, input);
  }

  @Mutation(() => ReconciliationDTO)
  async reconcilePayment(
    @AuthWorkspace() workspace: WorkspaceEntity,
    @Args('input') input: ReconcilePaymentInput,
  ) {
    return this.service.reconcilePayment(
      workspace.id, input.paymentId, input.dealId,
      input.invoiceId, input.amount, input.source,
    );
  }
}
