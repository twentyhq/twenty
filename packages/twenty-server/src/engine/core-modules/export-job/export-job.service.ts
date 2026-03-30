import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { ExportJobEntity } from 'src/engine/core-modules/export-job/entities/export-job.entity';
import { ExportJobStatus } from 'src/engine/core-modules/export-job/enums/export-job-status.enum';
import { InjectMessageQueue } from 'src/engine/core-modules/message-queue/decorators/message-queue.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { MessageQueueService } from 'src/engine/core-modules/message-queue/services/message-queue.service';
import { SubscriptionService } from 'src/engine/subscriptions/subscription.service';
import { SubscriptionChannel } from 'src/engine/subscriptions/enums/subscription-channel.enum';

export const EXPORT_JOB_PROCESSOR_NAME = 'export-job';

export type ExportJobData = {
  exportJobId: string;
  workspaceId: string;
};

@Injectable()
export class ExportJobService {
  constructor(
    @InjectRepository(ExportJobEntity)
    private readonly exportJobRepository: Repository<ExportJobEntity>,
    @InjectMessageQueue(MessageQueue.exportQueue)
    private readonly exportQueueService: MessageQueueService,
    private readonly subscriptionService: SubscriptionService,
  ) {}

  async startExportJob({
    workspaceId,
    workspaceMemberId,
    objectNameSingular,
    filter,
    orderBy,
    columns,
    relationConfigs,
    format,
  }: {
    workspaceId: string;
    workspaceMemberId?: string;
    objectNameSingular: string;
    filter?: Record<string, unknown>;
    orderBy?: Record<string, unknown>;
    columns: Record<string, unknown>[];
    relationConfigs?: Record<string, unknown>[];
    format?: string;
  }): Promise<ExportJobEntity> {
    const exportJob = this.exportJobRepository.create({
      workspaceId,
      workspaceMemberId: workspaceMemberId ?? null,
      objectNameSingular,
      filter: filter ?? null,
      orderBy: orderBy ?? null,
      columns,
      relationConfigs: relationConfigs ?? null,
      format: format ?? 'csv',
      status: ExportJobStatus.PENDING,
    });

    const savedJob = await this.exportJobRepository.save(exportJob);

    await this.exportQueueService.add<ExportJobData>(
      EXPORT_JOB_PROCESSOR_NAME,
      {
        exportJobId: savedJob.id,
        workspaceId,
      },
      { retryLimit: 2 },
    );

    return savedJob;
  }

  async cancelExportJob(
    id: string,
    workspaceId: string,
  ): Promise<ExportJobEntity> {
    await this.exportJobRepository.update(
      { id, workspaceId },
      { status: ExportJobStatus.CANCELLED },
    );

    const job = await this.exportJobRepository.findOneByOrFail({
      id,
      workspaceId,
    });

    await this.publishProgress(job);

    return job;
  }

  async getExportJob(
    id: string,
    workspaceId: string,
  ): Promise<ExportJobEntity | null> {
    return this.exportJobRepository.findOneBy({ id, workspaceId });
  }

  async updateProgress(
    id: string,
    updates: Partial<
      Pick<
        ExportJobEntity,
        'status' | 'processedRecords' | 'totalRecords' | 'result'
      >
    >,
  ): Promise<void> {
    await this.exportJobRepository.update(id, updates as any);

    const job = await this.exportJobRepository.findOneByOrFail({ id });

    await this.publishProgress(job);
  }

  private async publishProgress(job: ExportJobEntity): Promise<void> {
    await this.subscriptionService.publish({
      channel: SubscriptionChannel.EXPORT_JOB_PROGRESS,
      workspaceId: job.workspaceId,
      payload: {
        exportJobId: job.id,
        status: job.status,
        processedRecords: job.processedRecords,
        totalRecords: job.totalRecords,
        result: job.result,
      },
    });
  }
}
