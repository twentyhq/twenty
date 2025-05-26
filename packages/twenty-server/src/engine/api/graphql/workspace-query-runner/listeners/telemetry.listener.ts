import { Injectable } from '@nestjs/common';

import { OnCustomBatchEvent } from 'src/engine/api/graphql/graphql-query-runner/decorators/on-custom-batch-event.decorator';
import { USER_SIGNUP_EVENT_NAME } from 'src/engine/api/graphql/workspace-query-runner/constants/user-signup-event-name.constants';
import { AuditService } from 'src/engine/core-modules/audit/services/audit.service';
import { USER_SIGNUP_EVENT } from 'src/engine/core-modules/audit/utils/events/workspace-event/user/user-signup';
import { ObjectRecordCreateEvent } from 'src/engine/core-modules/event-emitter/types/object-record-create.event';
import { TelemetryService } from 'src/engine/core-modules/telemetry/telemetry.service';
import { WorkspaceEventBatch } from 'src/engine/workspace-event-emitter/types/workspace-event.type';

@Injectable()
export class TelemetryListener {
  constructor(
    private readonly auditService: AuditService,
    private readonly telemetryService: TelemetryService,
  ) {}

  @OnCustomBatchEvent(USER_SIGNUP_EVENT_NAME)
  async handleUserSignup(
    payload: WorkspaceEventBatch<ObjectRecordCreateEvent>,
  ) {
    await Promise.all(
      payload.events.map(async (eventPayload) => {
        this.auditService
          .createContext({
            userId: eventPayload.userId,
            workspaceId: payload.workspaceId,
          })
          .insertWorkspaceEvent(USER_SIGNUP_EVENT, {});

        this.telemetryService.create(
          {
            action: USER_SIGNUP_EVENT_NAME,
            payload: {
              payload,
              userId: undefined,
              workspaceId: undefined,
            },
          },
          eventPayload.userId,
          payload.workspaceId,
        );
      }),
    );
  }
}
