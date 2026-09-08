import { isNonEmptyString } from '@sniptt/guards';
import { type AppConnection } from 'twenty-sdk/logic-function';

import { type CallRecordingShareWith } from 'src/logic-functions/types/call-recording-share-with.type';

export const resolveCallRecordingShareWith = (
  connection: Pick<AppConnection, 'visibility' | 'workspaceMemberId'>,
): CallRecordingShareWith[] => {
  if (connection.visibility !== 'user') {
    return [{ everyone: true, accessLevel: 'READ' }];
  }

  if (!isNonEmptyString(connection.workspaceMemberId)) {
    throw new Error(
      'This personal Fathom connection has no workspace member left to own its recordings; reconnect Fathom to resume the import',
    );
  }

  return [
    { workspaceMemberId: connection.workspaceMemberId, accessLevel: 'FULL' },
  ];
};
