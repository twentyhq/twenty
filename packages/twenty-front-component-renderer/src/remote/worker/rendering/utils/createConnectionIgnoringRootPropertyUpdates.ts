import { MUTATION_TYPE_UPDATE_PROPERTY, ROOT_ID } from '@remote-dom/core';
import { type RemoteConnection } from '@remote-dom/core/elements';
import { isNonEmptyArray } from 'twenty-shared/utils';

export const createConnectionIgnoringRootPropertyUpdates = (
  connection: RemoteConnection,
): RemoteConnection => ({
  call: connection.call,
  mutate: (records) => {
    const forwardedRecords = records.filter(
      ([mutationType, remoteNodeId]) =>
        mutationType !== MUTATION_TYPE_UPDATE_PROPERTY ||
        remoteNodeId !== ROOT_ID,
    );

    if (!isNonEmptyArray(forwardedRecords)) {
      return;
    }

    connection.mutate(forwardedRecords);
  },
});
