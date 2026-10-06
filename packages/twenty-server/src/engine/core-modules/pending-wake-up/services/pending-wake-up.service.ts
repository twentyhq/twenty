import { Injectable } from '@nestjs/common';

import { type PendingWakeUpCondition } from 'twenty-shared/pending-wake-up';
import { isDefined } from 'twenty-shared/utils';
import { v4 } from 'uuid';

import { InjectMessageQueue } from 'src/engine/core-modules/message-queue/decorators/message-queue.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { MessageQueueService } from 'src/engine/core-modules/message-queue/services/message-queue.service';
import { RESUME_PENDING_WAKE_UP_JOB_NAME } from 'src/engine/core-modules/pending-wake-up/constants/resume-pending-wake-up-job-name.constant';
import { PendingWakeUpEntity } from 'src/engine/core-modules/pending-wake-up/entities/pending-wake-up.entity';
import { PendingWakeUpOwnerHandlerRegistryService } from 'src/engine/core-modules/pending-wake-up/services/pending-wake-up-owner-handler-registry.service';
import { type PendingWakeUpOwner } from 'src/engine/core-modules/pending-wake-up/types/pending-wake-up-owner.type';
import { type PendingWakeUpOwnerType } from 'src/engine/core-modules/pending-wake-up/types/pending-wake-up-owner-type.type';
import { type ResumePendingWakeUpJobData } from 'src/engine/core-modules/pending-wake-up/types/resume-pending-wake-up-job-data.type';
import { InjectWorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/inject-workspace-scoped-repository.decorator';
import { WorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/workspace-scoped-repository';

type ScheduledWakeUp = Pick<
  PendingWakeUpEntity,
  'id' | 'workspaceId' | 'ownerType' | 'ownerId'
>;

@Injectable()
export class PendingWakeUpService {
  constructor(
    @InjectWorkspaceScopedRepository(PendingWakeUpEntity)
    private readonly pendingWakeUpRepository: WorkspaceScopedRepository<PendingWakeUpEntity>,
    @InjectMessageQueue(MessageQueue.delayedJobsQueue)
    private readonly messageQueueService: MessageQueueService,
    private readonly pendingWakeUpOwnerHandlerRegistryService: PendingWakeUpOwnerHandlerRegistryService,
  ) {}

  async arm({
    workspaceId,
    owner,
    condition,
  }: {
    workspaceId: string;
    owner: PendingWakeUpOwner;
    condition: PendingWakeUpCondition;
  }): Promise<void> {
    const resumeAt =
      condition.type === 'TIME'
        ? new Date(condition.resumeAt)
        : isDefined(condition.expiresAt)
          ? new Date(condition.expiresAt)
          : null;

    // An owner waiting again, in a loop or a retry, replaces its previous wake-up in one statement.
    // The fresh id leaves stale jobs of the previous wake-up nothing to claim
    const wakeUpId = v4();

    await this.pendingWakeUpRepository.upsert(
      workspaceId,
      {
        id: wakeUpId,
        ownerType: owner.type,
        ownerId: owner.id,
        ownerKey: owner.key,
        condition,
        eventName: condition.type === 'EVENT' ? condition.eventName : null,
        resumeAt,
      },
      ['ownerType', 'ownerId', 'ownerKey'],
    );

    if (!isDefined(resumeAt)) {
      return;
    }

    await this.scheduleResolution({
      wakeUp: {
        id: wakeUpId,
        workspaceId,
        ownerType: owner.type,
        ownerId: owner.id,
      },
      delayMs: resumeAt.getTime() - Date.now(),
    });
  }

  async scheduleResolution({
    wakeUp,
    event,
    attempt,
    recordReadAttempt,
    delayMs = 0,
  }: Pick<
    ResumePendingWakeUpJobData,
    'event' | 'attempt' | 'recordReadAttempt'
  > & {
    wakeUp: ScheduledWakeUp;
    delayMs?: number;
  }): Promise<void> {
    await this.messageQueueService.add<ResumePendingWakeUpJobData>(
      RESUME_PENDING_WAKE_UP_JOB_NAME,
      {
        workspaceId: wakeUp.workspaceId,
        wakeUpId: wakeUp.id,
        event,
        attempt,
        recordReadAttempt,
      },
      {
        ...this.buildResumeJobOptions(wakeUp),
        delay: Math.max(delayMs, 0),
      },
    );
  }

  // A wake-up stays overdue until its job claims it, so each sweep would queue it again
  async scheduleOverdueResolution(wakeUp: ScheduledWakeUp): Promise<void> {
    await this.messageQueueService.add<ResumePendingWakeUpJobData>(
      RESUME_PENDING_WAKE_UP_JOB_NAME,
      { workspaceId: wakeUp.workspaceId, wakeUpId: wakeUp.id },
      {
        ...this.buildResumeJobOptions(wakeUp),
        deduplication: { id: `overdue-pending-wake-up-${wakeUp.id}` },
      },
    );
  }

  async find({
    workspaceId,
    wakeUpId,
  }: {
    workspaceId: string;
    wakeUpId: string;
  }): Promise<PendingWakeUpEntity | null> {
    return this.pendingWakeUpRepository.findOne(workspaceId, {
      where: { id: wakeUpId },
    });
  }

  async claim({
    workspaceId,
    wakeUpId,
  }: {
    workspaceId: string;
    wakeUpId: string;
  }): Promise<PendingWakeUpEntity | null> {
    const [claimedWakeUp] = await this.pendingWakeUpRepository.deleteAndReturn(
      workspaceId,
      { id: wakeUpId },
    );

    return claimedWakeUp ?? null;
  }

  async findEventWakeUps({
    workspaceId,
    eventName,
  }: {
    workspaceId: string;
    eventName: string;
  }): Promise<PendingWakeUpEntity[]> {
    return this.pendingWakeUpRepository.find(workspaceId, {
      where: { eventName },
    });
  }

  async cancel({
    workspaceId,
    owner,
  }: {
    workspaceId: string;
    owner: PendingWakeUpOwner;
  }): Promise<void> {
    await this.pendingWakeUpRepository.delete(workspaceId, {
      ownerType: owner.type,
      ownerId: owner.id,
      ownerKey: owner.key,
    });
  }

  async cancelAllForOwner({
    workspaceId,
    ownerType,
    ownerId,
  }: {
    workspaceId: string;
    ownerType: PendingWakeUpOwnerType;
    ownerId: string;
  }): Promise<void> {
    await this.pendingWakeUpRepository.delete(workspaceId, {
      ownerType,
      ownerId,
    });
  }

  private buildResumeJobOptions({ ownerType, ownerId }: ScheduledWakeUp) {
    return this.pendingWakeUpOwnerHandlerRegistryService
      .getHandlerOrThrow(ownerType)
      .buildResumeJobOptions(ownerId);
  }
}
