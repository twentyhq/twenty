import { UseGuards } from '@nestjs/common';
import { Args, Mutation, Query, Float, Int } from '@nestjs/graphql';
import { Field, ObjectType, InputType } from '@nestjs/graphql';

import { MetadataResolver } from 'src/engine/api/graphql/graphql-config/decorators/metadata-resolver.decorator';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import { WorkspaceAuthGuard } from 'src/engine/guards/workspace-auth.guard';
import { UserAuthGuard } from 'src/engine/guards/user-auth.guard';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { BankingLatamService } from './banking-latam.service';

@ObjectType()
class BankConnectionDTO {
  @Field() id: string;
  @Field() bankName: string;
  @Field({ nullable: true }) status?: string;
  @Field({ nullable: true }) currency?: string;
  @Field({ nullable: true }) network?: string;
  @Field(() => Float, { nullable: true }) currentBalance?: number;
}

@ObjectType()
class BankTransactionDTO {
  @Field() id: string;
  @Field({ nullable: true }) type?: string;
  @Field(() => Float) amount: number;
  @Field({ nullable: true }) description?: string;
  @Field({ nullable: true }) reconciliationStatus?: string;
}

@ObjectType()
class BankReconciliationDTO {
  @Field() id: string;
  @Field(() => Int) totalTransactions: number;
  @Field(() => Int) matchedTransactions: number;
  @Field(() => Int) unmatchedTransactions: number;
  @Field({ nullable: true }) status?: string;
}

@ObjectType()
class PaymentFileDTO {
  @Field() id: string;
  @Field() fileName: string;
  @Field(() => Int) recordCount: number;
  @Field(() => Float) totalAmount: number;
  @Field({ nullable: true }) format?: string;
}

@ObjectType()
class ImportResultDTO {
  @Field(() => Int) imported: number;
  @Field(() => Int) duplicates: number;
  @Field(() => Int) errors: number;
}

@ObjectType()
class BankingAnalyticsDTO {
  @Field(() => Int) totalConnections: number;
  @Field(() => Float) totalBalance: number;
  @Field(() => Int) transactionsThisMonth: number;
  @Field(() => Int) reconciliationRate: number;
  @Field(() => Int) pendingPayments: number;
}

@InputType()
class CreateConnectionInput {
  @Field() bankName: string;
  @Field() accountNumber: string;
  @Field({ nullable: true }) bankCode?: string;
  @Field({ nullable: true }) currency?: string;
  @Field({ nullable: true }) country?: string;
}

@InputType()
class PaymentItemInput {
  @Field() beneficiary: string;
  @Field() account: string;
  @Field(() => Float) amount: number;
  @Field() reference: string;
}

@InputType()
class GeneratePaymentFileInput {
  @Field() connectionId: string;
  @Field({ nullable: true }) format?: string;
  @Field(() => [PaymentItemInput]) payments: PaymentItemInput[];
}

@MetadataResolver()
@UseGuards(WorkspaceAuthGuard, UserAuthGuard)
export class BankingLatamResolver {
  constructor(private readonly service: BankingLatamService) {}

  @Mutation(() => BankConnectionDTO)
  async createBankConnection(
    @AuthWorkspace() workspace: WorkspaceEntity,
    @Args('input') input: CreateConnectionInput,
  ) {
    return this.service.createConnection(workspace.id, input);
  }

  @Mutation(() => BankReconciliationDTO)
  async reconcileBankTransactions(
    @AuthWorkspace() workspace: WorkspaceEntity,
    @Args('connectionId') connectionId: string,
    @Args('periodStart') periodStart: string,
    @Args('periodEnd') periodEnd: string,
  ) {
    return this.service.reconcileAutomatically(workspace.id, connectionId, new Date(periodStart), new Date(periodEnd));
  }

  @Mutation(() => PaymentFileDTO)
  async generatePaymentFile(
    @AuthWorkspace() workspace: WorkspaceEntity,
    @Args('input') input: GeneratePaymentFileInput,
  ) {
    return this.service.generatePaymentFile(workspace.id, input.connectionId, {
      format: (input.format ?? 'csv') as Parameters<BankingLatamService['generatePaymentFile']>[2]['format'],
      payments: input.payments,
    });
  }

  @Query(() => [BankTransactionDTO])
  async getBankTransactions(
    @AuthWorkspace() workspace: WorkspaceEntity,
    @Args('connectionId') connectionId: string,
  ) {
    return this.service.getTransactionsByAccount(workspace.id, connectionId);
  }

  @Query(() => BankingAnalyticsDTO)
  async getBankingAnalytics(@AuthWorkspace() workspace: WorkspaceEntity) {
    return this.service.getBankingAnalytics(workspace.id);
  }
}
