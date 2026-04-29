import { UseGuards } from '@nestjs/common';
import { Args, Mutation, Query, Float, Int } from '@nestjs/graphql';
import { Field, ObjectType, InputType } from '@nestjs/graphql';

import { MetadataResolver } from 'src/engine/api/graphql/graphql-config/decorators/metadata-resolver.decorator';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import { WorkspaceAuthGuard } from 'src/engine/guards/workspace-auth.guard';
import { UserAuthGuard } from 'src/engine/guards/user-auth.guard';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { HRMService } from './hrm.service';

// --- DTOs ---
@ObjectType()
class EmployeeDTO {
  @Field() id: string;
  @Field({ nullable: true }) fullName?: string;
  @Field({ nullable: true }) email?: string;
  @Field({ nullable: true }) position?: string;
  @Field({ nullable: true }) department?: string;
  @Field({ nullable: true }) status?: string;
}

@ObjectType()
class OrgChartNodeDTO {
  @Field() id: string;
  @Field() name: string;
  @Field() position: string;
  @Field() department: string;
  @Field({ nullable: true }) managerId?: string;
}

@ObjectType()
class PayrollRecordDTO {
  @Field() id: string;
  @Field() employeeId: string;
  @Field() period: string;
  @Field(() => Float) baseSalary: number;
  @Field(() => Float) netPay: number;
  @Field(() => Float) healthDeduction: number;
  @Field(() => Float) pensionDeduction: number;
  @Field(() => Float) taxWithholding: number;
}

@ObjectType()
class PerformanceReviewDTO {
  @Field() id: string;
  @Field({ nullable: true }) employeeId?: string;
}

@ObjectType()
class LeaveRequestDTO {
  @Field() id: string;
  @Field({ nullable: true }) status?: string;
  @Field(() => Int, { nullable: true }) days?: number;
}

@ObjectType()
class ENPSDTO {
  @Field(() => Int) enps: number;
  @Field(() => Int) promoters: number;
  @Field(() => Int) detractors: number;
}

@ObjectType()
class WorkforceAnalyticsDTO {
  @Field(() => Int) headcount: number;
  @Field(() => Float) avgSalary: number;
  @Field(() => Int) turnoverRate: number;
  @Field(() => Float) payrollCost: number;
}

@InputType()
class CreateEmployeeInput {
  @Field() fullName: string;
  @Field({ nullable: true }) email?: string;
  @Field({ nullable: true }) position?: string;
  @Field({ nullable: true }) department?: string;
  @Field(() => Float, { nullable: true }) baseSalary?: number;
}

@InputType()
class CreateReviewInput {
  @Field() employeeId: string;
  @Field({ nullable: true }) reviewerId?: string;
  @Field({ nullable: true }) period?: string;
  @Field(() => Int, { nullable: true }) rating?: number;
}

@InputType()
class RequestLeaveInput {
  @Field() employeeId: string;
  @Field({ nullable: true }) type?: string;
  @Field(() => Int) days: number;
  @Field({ nullable: true }) startDate?: Date;
}

@InputType()
class PayrollExtrasInput {
  @Field(() => Float, { nullable: true }) overtime?: number;
  @Field(() => Float, { nullable: true }) commissions?: number;
  @Field(() => Float, { nullable: true }) bonuses?: number;
}

// --- Resolver ---
@MetadataResolver()
@UseGuards(WorkspaceAuthGuard, UserAuthGuard)
export class HRMResolver {
  constructor(private readonly service: HRMService) {}

  @Mutation(() => EmployeeDTO)
  async createEmployee(
    @AuthWorkspace() workspace: WorkspaceEntity,
    @Args('input') input: CreateEmployeeInput,
  ) {
    return this.service.createEmployee(workspace.id, input);
  }

  @Query(() => [OrgChartNodeDTO])
  async getOrgChart(@AuthWorkspace() workspace: WorkspaceEntity) {
    return this.service.getOrgChart(workspace.id);
  }

  @Mutation(() => PayrollRecordDTO)
  async calculatePayroll(
    @AuthWorkspace() workspace: WorkspaceEntity,
    @Args('employeeId') employeeId: string,
    @Args('period') period: string,
    @Args('extras', { nullable: true }) extras?: PayrollExtrasInput,
  ) {
    return this.service.calculatePayroll(workspace.id, employeeId, period, extras);
  }

  @Mutation(() => PerformanceReviewDTO)
  async createReview(
    @AuthWorkspace() workspace: WorkspaceEntity,
    @Args('input') input: CreateReviewInput,
  ) {
    return this.service.createReview(workspace.id, input);
  }

  @Mutation(() => LeaveRequestDTO)
  async requestLeave(
    @AuthWorkspace() workspace: WorkspaceEntity,
    @Args('input') input: RequestLeaveInput,
  ) {
    return this.service.requestLeave(workspace.id, input);
  }

  @Mutation(() => LeaveRequestDTO)
  async approveLeave(
    @AuthWorkspace() workspace: WorkspaceEntity,
    @Args('leaveId') leaveId: string,
    @Args('approverId') approverId: string,
  ) {
    return this.service.approveLeave(leaveId, approverId);
  }

  @Query(() => ENPSDTO)
  async getENPS(@AuthWorkspace() workspace: WorkspaceEntity) {
    return this.service.getENPS(workspace.id);
  }

  @Query(() => WorkforceAnalyticsDTO)
  async getWorkforceAnalytics(@AuthWorkspace() workspace: WorkspaceEntity) {
    return this.service.getWorkforceAnalytics(workspace.id);
  }
}
