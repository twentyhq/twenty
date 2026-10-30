import { kv } from 'twenty-sdk/logic-function';
import { isDefined } from 'twenty-sdk/utils';

import { getLinkedinHistoryImportChunkKvKey } from 'src/logic-functions/utils/get-linkedin-history-import-chunk-kv-key.util';
import { type LinkedinHistoryImportState } from 'src/types/linkedin-history-import-state.type';

export const deleteLinkedinHistoryImportChunkResults = async ({
  connectedAccountId,
  state,
}: {
  connectedAccountId: string;
  state: LinkedinHistoryImportState;
}): Promise<void> => {
  const chunkCount = state.chunkCount ?? state.plannedChunkCount;

  if (!isDefined(chunkCount)) {
    return;
  }

  await Promise.all(
    Array.from({ length: chunkCount }, (_, chunkIndex) =>
      (['result', 'progress'] as const).map((kind) =>
        kv.delete(
          getLinkedinHistoryImportChunkKvKey({
            connectedAccountId,
            runId: state.runId,
            chunkIndex,
            kind,
          }),
        ),
      ),
    ).flat(),
  );
};
