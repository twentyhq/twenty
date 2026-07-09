import { CoreApiClient } from 'twenty-client-sdk/core';
import { defineLogicFunction } from 'twenty-sdk/define';
import { type RoutePayload } from 'twenty-sdk/logic-function';

import { MIGRATION_STATUS } from 'src/constants/migration-status';
import {
  CONTROL_MIGRATION_ROUTE_PATH,
  RUN_MIGRATION_TICK_ROUTE_PATH,
} from 'src/constants/route-paths';
import { CONTROL_MIGRATION_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import { getErrorMessage } from 'src/logic-functions/salesforce/salesforce-errors';
import { postToOwnRoute } from 'src/logic-functions/utils/post-to-own-route';

type ControlAction = 'start' | 'pause' | 'resume' | 'cancel';

type ControlRequestBody = {
  migrationId?: string;
  action?: ControlAction;
};

type ControlResponse = {
  success: boolean;
  status?: string;
  error?: string;
};

const ALLOWED_TRANSITIONS: Record<ControlAction, string[]> = {
  start: [MIGRATION_STATUS.READY, MIGRATION_STATUS.PAUSED, MIGRATION_STATUS.FAILED],
  resume: [MIGRATION_STATUS.PAUSED, MIGRATION_STATUS.FAILED],
  pause: [MIGRATION_STATUS.RUNNING],
  cancel: [
    MIGRATION_STATUS.READY,
    MIGRATION_STATUS.RUNNING,
    MIGRATION_STATUS.PAUSED,
    MIGRATION_STATUS.FAILED,
  ],
};

const ACTION_TARGET_STATUS: Record<ControlAction, string> = {
  start: MIGRATION_STATUS.RUNNING,
  resume: MIGRATION_STATUS.RUNNING,
  pause: MIGRATION_STATUS.PAUSED,
  cancel: MIGRATION_STATUS.CANCELLED,
};

const handler = async (
  event: RoutePayload<ControlRequestBody>,
): Promise<ControlResponse> => {
  const body = (event.body ?? {}) as ControlRequestBody;
  const { migrationId, action } = body;

  if (!migrationId || !action || !(action in ALLOWED_TRANSITIONS)) {
    return {
      success: false,
      error: 'migrationId and a valid action (start, pause, resume, cancel) are required.',
    };
  }

  try {
    const client = new CoreApiClient();
    const response = await client.query({
      salesforceMigration: {
        __args: { filter: { id: { eq: migrationId } } },
        id: true,
        status: true,
        startedAt: true,
      },
    });

    const migration = (response as Record<string, any>).salesforceMigration as
      | { id: string; status: string; startedAt: string | null }
      | undefined;

    if (!migration) {
      return { success: false, error: 'Migration not found.' };
    }

    if (!ALLOWED_TRANSITIONS[action].includes(migration.status)) {
      return {
        success: false,
        error: `Cannot ${action} a migration in status ${migration.status}.`,
      };
    }

    const targetStatus = ACTION_TARGET_STATUS[action];

    await client.mutation({
      updateSalesforceMigration: {
        __args: {
          id: migrationId,
          data: {
            status: targetStatus,
            lastError: null,
            ...(targetStatus === MIGRATION_STATUS.RUNNING &&
            migration.startedAt === null
              ? { startedAt: new Date().toISOString() }
              : {}),
            ...(targetStatus === MIGRATION_STATUS.CANCELLED
              ? { completedAt: new Date().toISOString() }
              : {}),
          },
        },
        id: true,
      },
    });

    if (targetStatus === MIGRATION_STATUS.RUNNING) {
      // Kick the self-chaining worker; it processes slices back to back
      // until the migration completes, pauses, or fails.
      await postToOwnRoute({ path: RUN_MIGRATION_TICK_ROUTE_PATH, body: {} });
    }

    return { success: true, status: targetStatus };
  } catch (error) {
    return { success: false, error: getErrorMessage(error) };
  }
};

export default defineLogicFunction({
  universalIdentifier: CONTROL_MIGRATION_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER,
  name: 'control-salesforce-migration',
  description:
    'Starts, pauses, resumes, or cancels a Salesforce migration. Starting and resuming kick the self-chaining migration worker.',
  timeoutSeconds: 60,
  handler,
  httpRouteTriggerSettings: {
    path: CONTROL_MIGRATION_ROUTE_PATH,
    httpMethod: 'POST',
    isAuthRequired: true,
  },
});
