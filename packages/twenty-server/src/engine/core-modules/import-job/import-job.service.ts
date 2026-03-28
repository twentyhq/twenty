import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { ImportJobEntity } from 'src/engine/core-modules/import-job/entities/import-job.entity';
import { ImportJobStatus } from 'src/engine/core-modules/import-job/enums/import-job-status.enum';
import { InjectMessageQueue } from 'src/engine/core-modules/message-queue/decorators/message-queue.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { MessageQueueService } from 'src/engine/core-modules/message-queue/services/message-queue.service';
import { SubscriptionService } from 'src/engine/subscriptions/subscription.service';
import { SubscriptionChannel } from 'src/engine/subscriptions/enums/subscription-channel.enum';

export const IMPORT_JOB_PROCESSOR_NAME = 'import-job';

export type ImportJobData = {
  importJobId: string;
  workspaceId: string;
};

@Injectable()
export class ImportJobService {
  constructor(
    @InjectRepository(ImportJobEntity, 'core')
    private readonly importJobRepository: Repository<ImportJobEntity>,
    @InjectMessageQueue(MessageQueue.importQueue)
    private readonly importQueueService: MessageQueueService,
    private readonly subscriptionService: SubscriptionService,
  ) {}

  async startImportJob({
    workspaceId,
    workspaceMemberId,
    objectNameSingular,
    fileName,
    columnMappings,
    validatedRows,
  }: {
    workspaceId: string;
    workspaceMemberId?: string;
    objectNameSingular: string;
    fileName?: string;
    columnMappings: Record<string, unknown>;
    validatedRows: Record<string, unknown>[];
  }): Promise<ImportJobEntity> {
    const importJob = this.importJobRepository.create({
      workspaceId,
      workspaceMemberId: workspaceMemberId ?? null,
      objectNameSingular,
      fileName: fileName ?? null,
      columnMappings,
      validatedRows,
      status: ImportJobStatus.PENDING,
      totalRecords: validatedRows.length,
    });

    const savedJob = await this.importJobRepository.save(importJob);

    await this.importQueueService.add<ImportJobData>(
      IMPORT_JOB_PROCESSOR_NAME,
      {
        importJobId: savedJob.id,
        workspaceId,
      },
      { retryLimit: 2 },
    );

    return savedJob;
  }

  async cancelImportJob(
    id: string,
    workspaceId: string,
  ): Promise<ImportJobEntity> {
    await this.importJobRepository.update(
      { id, workspaceId },
      { status: ImportJobStatus.CANCELLED },
    );

    const job = await this.importJobRepository.findOneByOrFail({
      id,
      workspaceId,
    });

    await this.publishProgress(job);

    return job;
  }

  async getImportJob(
    id: string,
    workspaceId: string,
  ): Promise<ImportJobEntity | null> {
    return this.importJobRepository.findOneBy({ id, workspaceId });
  }

  async updateProgress(
    id: string,
    updates: Partial<
      Pick<
        ImportJobEntity,
        | 'status'
        | 'processedRecords'
        | 'successCount'
        | 'warningCount'
        | 'failureCount'
        | 'result'
      >
    >,
  ): Promise<void> {
    await this.importJobRepository.update(id, updates as any);

    const job = await this.importJobRepository.findOneByOrFail({ id });

    await this.publishProgress(job);
  }

  private async publishProgress(job: ImportJobEntity): Promise<void> {
    await this.subscriptionService.publish({
      channel: SubscriptionChannel.IMPORT_JOB_PROGRESS,
      workspaceId: job.workspaceId,
      payload: {
        importJobId: job.id,
        status: job.status,
        processedRecords: job.processedRecords,
        totalRecords: job.totalRecords,
        successCount: job.successCount,
        warningCount: job.warningCount,
        failureCount: job.failureCount,
        result: job.result,
      },
    });
  }
}
