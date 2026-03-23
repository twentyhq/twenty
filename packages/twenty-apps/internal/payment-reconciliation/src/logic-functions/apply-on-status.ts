import {
  defineLogicFunction,
  type DatabaseEventPayload,
  type ObjectRecordUpdateEvent,
} from 'twenty-sdk';

import { APPLY_ON_STATUS_LOGIC_FUNCTION_ID } from 'src/constants/universal-identifiers';
import {
  mutationWithRetry,
  queryWithRetry,
} from 'src/utils/api-retry';
import { runApplyUpdates } from 'src/utils/apply-updates';

type SourceFileRecord = {
  id: string;
  parseStatus?: string;
};

const setFailed = async (sourceFileId: string, message: string) => {
  try {
    await mutationWithRetry({
      updatePayReconSourceFile: {
        __args: {
          id: sourceFileId,
          data: {
            parseStatus: 'FAILED',
            parseError: message.slice(0, 450),
          },
        },
        id: true,
      },
    });
  } catch (updateError) {
    console.error(
      `[apply-on-status] CRITICAL: Failed to set FAILED status:`,
      updateError instanceof Error ? updateError.message : String(updateError),
    );
  }
};

const handler = async (
  params: DatabaseEventPayload<ObjectRecordUpdateEvent<SourceFileRecord>>,
) => {
  const sourceFile = params.properties.after;

  // Only run when parseStatus transitions to APPLYING
  if (sourceFile.parseStatus !== 'APPLYING') {
    return;
  }

  console.log(
    `[apply-on-status] SourceFile ${sourceFile.id} parseStatus changed to APPLYING, starting apply`,
  );

  // Re-fetch current status to prevent races
  let currentStatus: string | null = null;

  try {
    const { payReconSourceFiles: sfResult } = await queryWithRetry<{
      payReconSourceFiles: {
        edges: { node: { id: string; parseStatus: string | null } }[];
      };
    }>({
      payReconSourceFiles: {
        __args: { filter: { id: { eq: sourceFile.id } }, first: 1 },
        edges: { node: { id: true, parseStatus: true } },
      },
    });

    const currentFile = sfResult.edges[0]?.node;

    if (!currentFile) {
      console.error(
        `[apply-on-status] Could not re-fetch SourceFile ${sourceFile.id}`,
      );

      return;
    }

    currentStatus = currentFile.parseStatus;
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);

    console.error(`[apply-on-status] Guard query failed: ${msg}`);
    await setFailed(sourceFile.id, `Apply failed: guard query failed: ${msg}`);

    return;
  }

  if (currentStatus !== 'APPLYING') {
    console.log(
      `[apply-on-status] SourceFile ${sourceFile.id} status is now ${currentStatus}, skipping`,
    );

    return;
  }

  try {
    await runApplyUpdates(sourceFile.id);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);

    console.error(`[apply-on-status] Failed: ${errorMessage}`);
    await setFailed(sourceFile.id, `Apply failed: ${errorMessage}`);
  }
};

export default defineLogicFunction({
  universalIdentifier: APPLY_ON_STATUS_LOGIC_FUNCTION_ID,
  name: 'apply-on-status',
  description:
    'Auto-triggers apply-status-updates when a source file parseStatus transitions to APPLYING',
  timeoutSeconds: 300,
  handler,
  databaseEventTriggerSettings: {
    eventName: 'payReconSourceFile.updated',
  },
});
