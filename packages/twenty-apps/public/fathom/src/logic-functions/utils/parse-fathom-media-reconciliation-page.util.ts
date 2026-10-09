import { isNonEmptyArray } from '@sniptt/guards';

import { fathomMediaReconciliationQueryResultSchema } from 'src/logic-functions/schemas/fathom-media-reconciliation-query-result.schema';
import { type FathomMediaReconciliationPage } from 'src/logic-functions/types/fathom-media-reconciliation-plan.type';
import { mapCallRecordingMediaState } from 'src/logic-functions/utils/map-call-recording-media-state.util';
import { isDefined } from 'src/utils/is-defined';

export const parseFathomMediaReconciliationPage = (
  queryResult: unknown,
): FathomMediaReconciliationPage => {
  const connection =
    fathomMediaReconciliationQueryResultSchema.parse(
      queryResult,
    ).callRecordings;

  if (!isDefined(connection)) {
    return { callRecordings: [], hasNextPage: false };
  }

  return {
    callRecordings: connection.edges.map(({ node }) => ({
      ...mapCallRecordingMediaState(node),
      status: node.status,
      ...(node.transcript === undefined
        ? {}
        : { hasTranscript: isNonEmptyArray(node.transcript) }),
    })),
    hasNextPage: connection.pageInfo.hasNextPage,
  };
};
