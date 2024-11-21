import { Injectable } from '@nestjs/common';

import { OnboardingService } from 'src/engine/core-modules/onboarding/onboarding.service';
import {
  HandleWorkspaceMemberDeletedJob,
  HandleWorkspaceMemberDeletedJobData,
} from 'src/engine/core-modules/workspace/handle-workspace-member-deleted.job';
import { ObjectRecordDeleteEvent } from 'src/engine/core-modules/event-emitter/types/object-record-delete.event';
import { ObjectRecordUpdateEvent } from 'src/engine/core-modules/event-emitter/types/object-record-update.event';
import { InjectMessageQueue } from 'src/engine/core-modules/message-queue/decorators/message-queue.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { MessageQueueService } from 'src/engine/core-modules/message-queue/services/message-queue.service';
import { WorkspaceEventBatch } from 'src/engine/workspace-event-emitter/types/workspace-event.type';
import { WorkspaceMemberWorkspaceEntity } from 'src/modules/workspace-member/standard-objects/workspace-member.workspace-entity';
import { OnDatabaseBatchEvent } from 'src/engine/api/graphql/graphql-query-runner/decorators/on-database-batch-event.decorator';
import { DatabaseEventAction } from 'src/engine/api/graphql/graphql-query-runner/enums/database-event-action';

@Injectable()
export class WorkspaceWorkspaceMemberListener {
  constructor(
    private readonly onboardingService: OnboardingService,
    @InjectMessageQueue(MessageQueue.workspaceQueue)
    private readonly messageQueueService: MessageQueueService,
  ) {}

  @OnDatabaseBatchEvent('workspaceMember', DatabaseEventAction.UPDATED)
  async handleUpdateEvent(
    payload: WorkspaceEventBatch<
      ObjectRecordUpdateEvent<WorkspaceMemberWorkspaceEntity>
    >,
  ) {
    await Promise.all(
      payload.events.map((eventPayload) => {
        const { firstName: firstNameAfter, lastName: lastNameAfter } =
          eventPayload.properties.after.name;

        if (firstNameAfter === '' && lastNameAfter === '') {
          return;
        }

        if (!eventPayload.userId) {
          return;
        }

        return this.onboardingService.setOnboardingCreateProfilePending({
          userId: eventPayload.userId,
          workspaceId: payload.workspaceId,
          value: false,
        });
      }),
    );
  }

  @OnDatabaseBatchEvent('workspaceMember', DatabaseEventAction.DELETED)
  async handleDeleteEvent(
    payload: WorkspaceEventBatch<
      ObjectRecordDeleteEvent<WorkspaceMemberWorkspaceEntity>
    >,
  ) {
    await Promise.all(
      payload.events.map((eventPayload) => {
        const userId = eventPayload.properties.before.userId;

        if (!userId) {
          return;
        }

        return this.messageQueueService.add<HandleWorkspaceMemberDeletedJobData>(
          HandleWorkspaceMemberDeletedJob.name,
          { workspaceId: payload.workspaceId, userId },
        );
      }),
    );
  }
}
