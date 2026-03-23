import {
  defineLogicFunction,
  type DatabaseEventPayload,
  type ObjectRecordUpdateEvent,
} from 'twenty-sdk';

import { MATCH_ON_COMPLETED_LOGIC_FUNCTION_ID } from 'src/constants/universal-identifiers';
import {
  mutationWithRetry,
  queryWithRetry,
} from 'src/utils/api-retry';
import { runMatching } from 'src/utils/run-matching';

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
      `[match-on-completed] CRITICAL: Failed to set FAILED status:`,
      updateError instanceof Error ? updateError.message : String(updateError),
    );
  }
};

const handler = async (
  params: DatabaseEventPayload<ObjectRecordUpdateEvent<SourceFileRecord>>,
) => {
  const sourceFile = params.properties.after;

  // Only run when parseStatus transitions to COMPLETED
  if (sourceFile.parseStatus !== 'COMPLETED') {
    return;
  }

  console.log(
    `[match-on-completed] SourceFile ${sourceFile.id} parseStatus changed to COMPLETED, starting matching`,
  );

  // Re-fetch current status to prevent races (if another trigger already set MATCHING, bail)
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
        `[match-on-completed] Could not re-fetch SourceFile ${sourceFile.id}`,
      );

      return;
    }

    currentStatus = currentFile.parseStatus;
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);

    console.error(`[match-on-completed] Guard query failed: ${msg}`);
    await setFailed(sourceFile.id, `Matching failed: guard query failed: ${msg}`);

    return;
  }

  // If status is no longer COMPLETED, another trigger already picked it up
  if (currentStatus !== 'COMPLETED') {
    console.log(
      `[match-on-completed] SourceFile ${sourceFile.id} status is now ${currentStatus}, skipping`,
    );

    return;
  }

  try {
    await runMatching(sourceFile.id);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);

    console.error(`[match-on-completed] Failed: ${errorMessage}`);
    await setFailed(sourceFile.id, `Matching failed: ${errorMessage}`);
  }
};

export default defineLogicFunction({
  universalIdentifier: MATCH_ON_COMPLETED_LOGIC_FUNCTION_ID,
  name: 'match-on-completed',
  description:
    'Auto-triggers matching when a source file parseStatus transitions to COMPLETED after parsing',
  timeoutSeconds: 600,
  handler,
  databaseEventTriggerSettings: {
    eventName: 'payReconSourceFile.updated',
  },
});
