import { Injectable } from '@nestjs/common';

import { isPlainObject } from 'twenty-shared/utils';

import { type WorkspaceAuthContext } from 'src/engine/core-modules/auth/types/workspace-auth-context.type';
import { type PendingWakeUpEvent } from 'src/engine/core-modules/pending-wake-up/types/pending-wake-up-event.type';
import { type PendingWakeUpBeforeClaimDecision } from 'src/engine/core-modules/pending-wake-up/types/pending-wake-up-owner-handler.type';
import { computePendingWakeUpRetryDelayMs } from 'src/engine/core-modules/pending-wake-up/utils/compute-pending-wake-up-retry-delay-ms.util';
import { restrictPendingWakeUpEventToReadableRecord } from 'src/engine/core-modules/pending-wake-up/utils/restrict-pending-wake-up-event-to-readable-record.util';
import { FindRecordsService } from 'src/engine/core-modules/record-crud/services/find-records.service';
import { type RolePermissionConfig } from 'src/engine/twenty-orm/types/role-permission-config.type';

const RECORD_READ_MAX_ATTEMPTS = 8;

@Injectable()
export class PendingWakeUpEventRecordService {
  constructor(private readonly findRecordsService: FindRecordsService) {}

  // The event's record is read with its owner's permissions: a record the owner cannot read must not
  // wake it up, so the wait goes on for another event. A failed read cannot tell a transient error from
  // an object the owner cannot read, so it is retried a few times
  async decideOnEventRecord<TResolveContext>({
    event,
    authContext,
    rolePermissionConfig,
    recordReadAttempt,
    context,
    onRecordReadGivenUp,
  }: {
    event: PendingWakeUpEvent;
    authContext: WorkspaceAuthContext;
    rolePermissionConfig: RolePermissionConfig;
    recordReadAttempt: number;
    context: TResolveContext;
    onRecordReadGivenUp: (error?: string) => void;
  }): Promise<PendingWakeUpBeforeClaimDecision<TResolveContext>> {
    const [objectName, action] = event.eventName.split('.');

    const { success, result, error } = await this.findRecordsService.execute({
      objectName,
      // a deleted record only reads when the filter asks for deleted records
      filter:
        action === 'deleted'
          ? { id: { eq: event.recordId }, deletedAt: { is: 'NOT_NULL' } }
          : { id: { eq: event.recordId } },
      limit: 1,
      authContext,
      rolePermissionConfig,
      shouldBuildEffectiveSelectFields: false,
    });

    if (!success) {
      if (recordReadAttempt < RECORD_READ_MAX_ATTEMPTS) {
        return {
          type: 'RETRY_LATER',
          recordReadAttempt: recordReadAttempt + 1,
          delayMs: computePendingWakeUpRetryDelayMs(recordReadAttempt),
        };
      }

      onRecordReadGivenUp(error);

      return { type: 'IGNORE' };
    }

    const record = result?.records[0];

    if (!isPlainObject(record)) {
      return { type: 'IGNORE' };
    }

    return {
      type: 'RESOLVE',
      event: restrictPendingWakeUpEventToReadableRecord({
        event,
        readableRecord: record,
      }),
      context,
    };
  }
}
