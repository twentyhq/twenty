import { UseGuards } from '@nestjs/common';
import { Args, Mutation, Query, Float, Int } from '@nestjs/graphql';
import { Field, ObjectType, InputType } from '@nestjs/graphql';

import { MetadataResolver } from 'src/engine/api/graphql/graphql-config/decorators/metadata-resolver.decorator';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import { WorkspaceAuthGuard } from 'src/engine/guards/workspace-auth.guard';
import { UserAuthGuard } from 'src/engine/guards/user-auth.guard';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { RevenueWaterfallService } from './revenue-waterfall.service';

@ObjectType()
class RevenueWaterfallDTO {
  @Field() id: string;
  @Field(() => Float) openingARR: number;
  @Field(() => Float) newBookings: number;
  @Field(() => Float) expansionRevenue: number;
  @Field(() => Float) churnedRevenue: number;
  @Field(() => Float) closingARR: number;
  @Field(() => Float) netRevenueRetention: number;
  @Field(() => Float) grossRevenueRetention: number;
}

@ObjectType()
class BookingEntryDTO {
  @Field() id: string;
  @Field() accountId: string;
  @Field({ nullable: true }) type?: string;
  @Field(() => Float) amount: number;
  @Field(() => Float) arrImpact: number;
}

@ObjectType()
class ChurnEntryDTO {
  @Field() id: string;
  @Field() accountId: string;
  @Field(() => Float) lostARR: number;
  @Field({ nullable: true }) reason?: string;
}

@ObjectType()
class ExpansionEntryDTO {
  @Field() id: string;
  @Field() accountId: string;
  @Field(() => Float) expansionAmount: number;
}

@ObjectType()
class ARRBreakdownDTO {
  @Field(() => Float) currentARR: number;
  @Field(() => Float) newARR: number;
  @Field(() => Float) expansionARR: number;
  @Field(() => Float) churnedARR: number;
  @Field(() => Float) netNewARR: number;
  @Field(() => Float) nrr: number;
  @Field(() => Float) grr: number;
}

@ObjectType()
class NRRPeriodDTO {
  @Field() period: string;
  @Field(() => Float) nrr: number;
  @Field(() => Float) grr: number;
  @Field(() => Float) closingARR: number;
}

@ObjectType()
class RevenueSegmentDTO {
  @Field() segment: string;
  @Field(() => Float) totalARR: number;
  @Field(() => Int) accountCount: number;
  @Field(() => Float) avgDealSize: number;
  @Field(() => Int) churnRate: number;
}

@InputType()
class AddBookingInput {
  @Field() accountId: string;
  @Field({ nullable: true }) dealId?: string;
  @Field({ nullable: true }) type?: string;
  @Field(() => Float) amount: number;
  @Field(() => Float) arrImpact: number;
  @Field() bookingDate: string;
  @Field({ nullable: true }) segment?: string;
}

@InputType()
class RecordChurnInput {
  @Field() accountId: string;
  @Field(() => Float) lostARR: number;
  @Field({ nullable: true }) reason?: string;
  @Field() churnDate: string;
}

@InputType()
class RecordExpansionInput {
  @Field() accountId: string;
  @Field(() => Float) previousARR: number;
  @Field(() => Float) newARR: number;
  @Field(() => Float) expansionAmount: number;
  @Field() expansionDate: string;
}

@MetadataResolver()
@UseGuards(WorkspaceAuthGuard, UserAuthGuard)
export class RevenueWaterfallResolver {
  constructor(private readonly service: RevenueWaterfallService) {}

  @Mutation(() => RevenueWaterfallDTO)
  async calculateRevenueWaterfall(
    @AuthWorkspace() workspace: WorkspaceEntity,
    @Args('periodStart') periodStart: string,
    @Args('periodEnd') periodEnd: string,
  ) {
    return this.service.calculateWaterfall(workspace.id, new Date(periodStart), new Date(periodEnd));
  }

  @Mutation(() => BookingEntryDTO)
  async addBooking(
    @AuthWorkspace() workspace: WorkspaceEntity,
    @Args('input') input: AddBookingInput,
  ) {
    return this.service.addBooking(workspace.id, { ...input, bookingDate: new Date(input.bookingDate) } as any);
  }

  @Mutation(() => ChurnEntryDTO)
  async recordChurn(
    @AuthWorkspace() workspace: WorkspaceEntity,
    @Args('input') input: RecordChurnInput,
  ) {
    return this.service.recordChurn(workspace.id, { ...input, churnDate: new Date(input.churnDate) } as any);
  }

  @Mutation(() => ExpansionEntryDTO)
  async recordExpansion(
    @AuthWorkspace() workspace: WorkspaceEntity,
    @Args('input') input: RecordExpansionInput,
  ) {
    return this.service.recordExpansion(workspace.id, { ...input, expansionDate: new Date(input.expansionDate) });
  }

  @Query(() => ARRBreakdownDTO)
  async getARRBreakdown(@AuthWorkspace() workspace: WorkspaceEntity) {
    return this.service.getARRBreakdown(workspace.id);
  }

  @Query(() => [NRRPeriodDTO])
  async getNetRevenueRetention(@AuthWorkspace() workspace: WorkspaceEntity) {
    return this.service.getNetRevenueRetention(workspace.id);
  }

  @Query(() => [RevenueSegmentDTO])
  async getRevenueBySegment(@AuthWorkspace() workspace: WorkspaceEntity) {
    return this.service.getRevenueBySegment(workspace.id);
  }
}
