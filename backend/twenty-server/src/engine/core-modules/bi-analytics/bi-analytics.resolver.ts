import { UseGuards } from '@nestjs/common';
import { Args, Mutation, Query, Float, Int } from '@nestjs/graphql';
import { Field, ObjectType, InputType } from '@nestjs/graphql';

import { MetadataResolver } from 'src/engine/api/graphql/graphql-config/decorators/metadata-resolver.decorator';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import { WorkspaceAuthGuard } from 'src/engine/guards/workspace-auth.guard';
import { UserAuthGuard } from 'src/engine/guards/user-auth.guard';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';

import { BIAnalyticsService } from './dashboard.service';

// --- DTOs ---
@ObjectType()
class WidgetDTO {
  @Field() id: string;
  @Field() dashboardId: string;
  @Field() title: string;
  @Field() type: string;
}

@ObjectType()
class ReportDTO {
  @Field() id: string;
  @Field() name: string;
  @Field() createdAt: Date;
}

@ObjectType()
class KPIDataDTO {
  @Field(() => Float) value: number;
  @Field(() => Int) change: number;
  @Field() trend: string;
}

@ObjectType()
class TimeSeriesPointDTO {
  @Field() date: string;
  @Field(() => Float) value: number;
}

@ObjectType()
class TopPerformerDTO {
  @Field() userId: string;
  @Field(() => Int) value: number;
}

@ObjectType()
class ReportResultDTO {
  @Field() metric: string;
  @Field(() => Float) current: number;
  @Field(() => Float) previous: number;
}

@InputType()
class CreateWidgetInput {
  @Field() dashboardId: string;
  @Field() title: string;
  @Field() type: string;
  @Field(() => Int, { nullable: true }) positionX?: number;
  @Field(() => Int, { nullable: true }) positionY?: number;
  @Field(() => Int, { nullable: true }) width?: number;
  @Field(() => Int, { nullable: true }) height?: number;
}

@InputType()
class CreateReportInput {
  @Field() name: string;
  @Field(() => [String], { nullable: true }) metrics?: string[];
}

// --- Resolver ---
@MetadataResolver()
@UseGuards(WorkspaceAuthGuard, UserAuthGuard)
export class BIAnalyticsResolver {
  constructor(private readonly biService: BIAnalyticsService) {}

  @Query(() => [WidgetDTO])
  async dashboardWidgets(
    @AuthWorkspace() workspace: WorkspaceEntity,
    @Args('dashboardId') dashboardId: string,
  ) {
    return this.biService.getWidgets(workspace.id, dashboardId);
  }

  @Mutation(() => WidgetDTO)
  async createWidget(
    @AuthWorkspace() workspace: WorkspaceEntity,
    @Args('input') input: CreateWidgetInput,
  ) {
    return this.biService.createWidget(workspace.id, input.dashboardId, input as any);
  }

  @Mutation(() => Boolean)
  async deleteWidget(@Args('widgetId') widgetId: string) {
    await this.biService.deleteWidget(widgetId);
    return true;
  }

  @Query(() => [ReportDTO])
  async analyticsReports(@AuthWorkspace() workspace: WorkspaceEntity) {
    return this.biService.getReports(workspace.id);
  }

  @Mutation(() => ReportDTO)
  async createReport(
    @AuthWorkspace() workspace: WorkspaceEntity,
    @Args('input') input: CreateReportInput,
  ) {
    return this.biService.createReport(workspace.id, input);
  }

  @Query(() => [ReportResultDTO])
  async runReport(@Args('reportId') reportId: string) {
    return this.biService.runReport(reportId);
  }

  @Query(() => KPIDataDTO)
  async kpiData(
    @AuthWorkspace() workspace: WorkspaceEntity,
    @Args('metric') metric: string,
  ) {
    return this.biService.getKPIData(workspace.id, metric);
  }

  @Query(() => [TimeSeriesPointDTO])
  async timeSeriesData(
    @AuthWorkspace() workspace: WorkspaceEntity,
    @Args('metric') metric: string,
    @Args('periodDays', { type: () => Int, defaultValue: 30 }) periodDays: number,
  ) {
    return this.biService.getTimeSeriesData(workspace.id, metric, periodDays);
  }

  @Query(() => [TopPerformerDTO])
  async topPerformers(
    @AuthWorkspace() workspace: WorkspaceEntity,
    @Args('limit', { type: () => Int, defaultValue: 10 }) limit: number,
  ) {
    return this.biService.getTopPerformers(workspace.id, limit);
  }
}
