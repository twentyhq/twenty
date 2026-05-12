import { captureMessage, withScope } from '@sentry/react';

import { getRecordFromRecordNode } from '@/object-record/cache/utils/getRecordFromRecordNode';
import { type RecordGqlConnectionEdgesRequired } from '@/object-record/graphql/types/RecordGqlConnectionEdgesRequired';
import { type ObjectRecord } from '@/object-record/types/ObjectRecord';
import { isDefined } from 'twenty-shared/utils';

export const getRecordsFromRecordConnection = <T extends ObjectRecord>({
  recordConnection,
}: {
  recordConnection: RecordGqlConnectionEdgesRequired;
}): T[] => {
  const edges = recordConnection?.edges ?? [];

  const invalidEdgeCount = edges.filter((edge) => !isDefined(edge?.node)).length;

  if (invalidEdgeCount > 0) {
    withScope((scope) => {
      scope.setFingerprint(['record-connection-missing-node']);
      scope.setLevel('warning');
      scope.setExtra('invalidEdgeCount', invalidEdgeCount);
      scope.setExtra('edgesCount', edges.length);

      captureMessage('Record connection contains edge without node');
    });
  }

  return edges
    .filter((edge) => isDefined(edge?.node))
    .map((edge) => getRecordFromRecordNode<T>({ recordNode: edge.node }));
};
