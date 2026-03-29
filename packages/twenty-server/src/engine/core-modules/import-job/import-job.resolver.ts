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
  ImportJobDTO,
  ImportJobProgressDTO,
} from 'src/engine/core-modules/import-job/dtos/import-job.dto';
import { ImportJobService } from 'src/engine/core-modules/import-job/import-job.service';
import { SubscriptionService } from 'src/engine/subscriptions/subscription.service';
import { SubscriptionChannel } from 'src/engine/subscriptions/enums/subscription-channel.enum';

@Resolver()
@UseGuards(WorkspaceAuthGuard, UserAuthGuard)
export class ImportJobResolver {
  constructor(
    private readonly importJobService: ImportJobService,
    private readonly subscriptionService: SubscriptionService,
  ) {}

  @Mutation(() => ImportJobDTO)
  async startImportJob(
    @Args('objectNameSingular') objectNameSingular: string,
    @Args('columnMappings', { type: () => GraphQLJSON })
    columnMappings: Record<string, unknown>,
    @Args('validatedRows', { type: () => GraphQLJSON })
    validatedRows: Record<string, unknown>[],
    @Args('fileName', { type: () => String, nullable: true }) fileName: string | undefined,
    @AuthWorkspace() workspace: WorkspaceEntity,
    @AuthUser() user: AuthContextUser,
  ): Promise<ImportJobDTO> {
    const job = await this.importJobService.startImportJob({
      workspaceId: workspace.id,
      workspaceMemberId: user.id,
      objectNameSingular,
      fileName,
      columnMappings,
      validatedRows,
    });

    return {
      id: job.id,
      objectNameSingular: job.objectNameSingular,
      fileName: job.fileName,
      status: job.status,
      totalRecords: job.totalRecords,
      processedRecords: job.processedRecords,
      successCount: job.successCount,
      warningCount: job.warningCount,
      failureCount: job.failureCount,
      result: job.result,
      createdAt: job.createdAt,
    };
  }

  @Mutation(() => ImportJobDTO)
  async cancelImportJob(
    @Args('importJobId') importJobId: string,
    @AuthWorkspace() workspace: WorkspaceEntity,
  ): Promise<ImportJobDTO> {
    const job = await this.importJobService.cancelImportJob(
      importJobId,
      workspace.id,
    );

    return {
      id: job.id,
      objectNameSingular: job.objectNameSingular,
      fileName: job.fileName,
      status: job.status,
      totalRecords: job.totalRecords,
      processedRecords: job.processedRecords,
      successCount: job.successCount,
      warningCount: job.warningCount,
      failureCount: job.failureCount,
      result: job.result,
      createdAt: job.createdAt,
    };
  }

  @Query(() => ImportJobDTO, { nullable: true })
  async importJob(
    @Args('importJobId') importJobId: string,
    @AuthWorkspace() workspace: WorkspaceEntity,
  ): Promise<ImportJobDTO | null> {
    const job = await this.importJobService.getImportJob(
      importJobId,
      workspace.id,
    );

    if (!job) return null;

    return {
      id: job.id,
      objectNameSingular: job.objectNameSingular,
      fileName: job.fileName,
      status: job.status,
      totalRecords: job.totalRecords,
      processedRecords: job.processedRecords,
      successCount: job.successCount,
      warningCount: job.warningCount,
      failureCount: job.failureCount,
      result: job.result,
      createdAt: job.createdAt,
    };
  }

  @Subscription(() => ImportJobProgressDTO, {
    nullable: true,
    resolve: (payload: Record<string, unknown>) => payload,
    filter: (
      payload: Record<string, unknown>,
      variables: { importJobId: string },
    ) => payload?.importJobId === variables.importJobId,
  })
  async onImportJobProgress(
    @Args('importJobId') _importJobId: string,
    @AuthWorkspace() workspace: WorkspaceEntity,
  ) {
    return this.subscriptionService.subscribe({
      channel: SubscriptionChannel.IMPORT_JOB_PROGRESS,
      workspaceId: workspace.id,
    });
  }
}
