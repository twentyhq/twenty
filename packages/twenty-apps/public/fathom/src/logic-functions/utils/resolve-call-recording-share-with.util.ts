import { isNonEmptyString } from '@sniptt/guards';
import { type AppConnection } from 'twenty-sdk/logic-function';

import { type CallRecordingShareWith } from 'src/logic-functions/types/call-recording-share-with.type';

export const resolveCallRecordingShareWith = (
  connection: Pick<AppConnection, 'visibility' | 'workspaceMemberId'>,
): CallRecordingShareWith[] =>
  connection.visibility === 'user' &&
  isNonEmptyString(connection.workspaceMemberId)
    ? [{ workspaceMemberId: connection.workspaceMemberId, accessLevel: 'FULL' }]
    : [{ everyone: true, accessLevel: 'READ' }];
