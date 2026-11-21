import { isNonEmptyString } from '@sniptt/guards';
import { type CoreApiClient } from 'twenty-client-sdk/core';
import { type IngestMessageParticipant } from 'twenty-sdk/logic-function';

import { fetchLineUserDisplayName } from 'src/logic-functions/data/fetch-line-user-display-name.util';
import { findOrCreateLinePersonId } from 'src/logic-functions/data/find-or-create-line-person-id.util';
import { type LineSource } from 'src/logic-functions/types/line-webhook.type';

const UNIDENTIFIED_MEMBER_HANDLE = 'unidentified-line-member';

// LINE leaves out the sender of a group message posted from a LINE client other than iOS or Android
export const resolveLineSender = async ({
  client,
  accessToken,
  botUserId,
  source,
}: {
  client: CoreApiClient;
  accessToken: string;
  botUserId: string;
  source: LineSource;
}): Promise<Omit<IngestMessageParticipant, 'role'>> => {
  const { userId } = source;

  if (!isNonEmptyString(userId)) {
    return { handle: UNIDENTIFIED_MEMBER_HANDLE, displayName: 'LINE member' };
  }

  const personId = await findOrCreateLinePersonId({
    client,
    botUserId,
    userId,
    resolveDisplayName: () =>
      fetchLineUserDisplayName({ accessToken, source, userId }),
  });

  return { handle: userId, personId };
};
