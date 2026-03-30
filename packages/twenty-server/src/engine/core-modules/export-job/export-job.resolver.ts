import { UseGuards } from '@nestjs/common';
import { Args, Mutation, Query, Resolver, Subscription } from '@nestjs/graphql';
import GraphQLJSON from 'graphql-type-json';

import { AuthUser } from 'src/engine/decorators/auth/auth-user.decorator';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import { UserAuthGuard } from 'src/engine/guards/user-auth.guard';
import { WorkspaceAuthGuard } from 'src/engine/guards/workspace-auth.guard';
import { type AuthContextUser } from 'src/engine/core-modules/auth/types/auth-context-user.type';
import { type WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import {
  ExportJobDTO,
  ExportJobProgressDTO,
} from 'src/engine/core-modules/export-job/dtos/export-job.dto';
import { ExportJobService } from 'src/engine/core-modules/export-job/export-job.service';
import { SubscriptionService } from 'src/engine/subscriptions/subscription.service';
import { SubscriptionChannel } from 'src/engine/subscriptions/enums/subscription-channel.enum';

@Resolver()
@UseGuards(WorkspaceAuthGuard, UserAuthGuard)
export class ExportJobResolver {
  constructor(
    private readonly exportJobService: ExportJobService,
    private readonly subscriptionService: SubscriptionService,
  ) {}

  @Mutation(() => ExportJobDTO)
  async startExportJob(
    @Args('objectNameSingular') objectNameSingular: string,
    @Args('columns', { type: () => GraphQLJSON })
    columns: Record<string, unknown>[],
    @Args('filter', { type: () => GraphQLJSON, nullable: true })
    filter: Record<string, unknown> | undefined,
    @Args('orderBy', { type: () => GraphQLJSON, nullable: true })
    orderBy: Record<string, unknown> | undefined,
    @Args('relationConfigs', { type: () => GraphQLJSON, nullable: true })
    relationConfigs: Record<string, unknown>[] | undefined,
    @Args('format', { type: () => String, nullable: true })
    format: string | undefined,
    @AuthWorkspace() workspace: WorkspaceEntity,
    @AuthUser() user: AuthContextUser,
  ): Promise<ExportJobDTO> {
    const job = await this.exportJobService.startExportJob({
      workspaceId: workspace.id,
      workspaceMemberId: user.id,
      objectNameSingular,
      filter,
      orderBy,
      columns,
      relationConfigs,
      format,
    });

    return {
      id: job.id,
      objectNameSingular: job.objectNameSingular,
      format: job.format,
      status: job.status,
      totalRecords: job.totalRecords,
      processedRecords: job.processedRecords,
      result: job.result,
      createdAt: job.createdAt,
    };
  }

  @Mutation(() => ExportJobDTO)
  async cancelExportJob(
    @Args('exportJobId') exportJobId: string,
    @AuthWorkspace() workspace: WorkspaceEntity,
  ): Promise<ExportJobDTO> {
    const job = await this.exportJobService.cancelExportJob(
      exportJobId,
      workspace.id,
    );

    return {
      id: job.id,
      objectNameSingular: job.objectNameSingular,
      format: job.format,
      status: job.status,
      totalRecords: job.totalRecords,
      processedRecords: job.processedRecords,
      result: job.result,
      createdAt: job.createdAt,
    };
  }

  @Query(() => ExportJobDTO, { nullable: true })
  async exportJob(
    @Args('exportJobId') exportJobId: string,
    @AuthWorkspace() workspace: WorkspaceEntity,
  ): Promise<ExportJobDTO | null> {
    const job = await this.exportJobService.getExportJob(
      exportJobId,
      workspace.id,
    );

    if (!job) return null;

    return {
      id: job.id,
      objectNameSingular: job.objectNameSingular,
      format: job.format,
      status: job.status,
      totalRecords: job.totalRecords,
      processedRecords: job.processedRecords,
      result: job.result,
      createdAt: job.createdAt,
    };
  }

  @Subscription(() => ExportJobProgressDTO, {
    nullable: true,
    resolve: (payload: Record<string, unknown>) => payload,
    filter: (
      payload: Record<string, unknown>,
      variables: { exportJobId: string },
    ) => payload?.exportJobId === variables.exportJobId,
  })
  async onExportJobProgress(
    @Args('exportJobId') _exportJobId: string,
    @AuthWorkspace() workspace: WorkspaceEntity,
  ) {
    return this.subscriptionService.subscribe({
      channel: SubscriptionChannel.EXPORT_JOB_PROGRESS,
      workspaceId: workspace.id,
    });
  }
}
