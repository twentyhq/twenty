import { type Meeting } from 'fathom-typescript/sdk/models/shared';
import { isDefined } from 'src/utils/is-defined';

import { type FathomMeetingLister } from 'src/logic-functions/types/fathom-meeting-lister.type';

export type FathomMeetingPage = {
  meetings: Meeting[];
  nextCursor: string | null;
};

export const listFathomMeetingPage = async ({
  fathomClient,
  createdAfter,
  cursor,
  recordedBy,
}: {
  fathomClient: FathomMeetingLister;
  createdAfter?: string;
  cursor?: string;
  recordedBy?: string[];
}): Promise<FathomMeetingPage> => {
  const { result } = await fathomClient.listMeetings({
    ...(isDefined(createdAfter) ? { createdAfter } : {}),
    ...(isDefined(cursor) ? { cursor } : {}),
    ...(isDefined(recordedBy) ? { recordedBy } : {}),
    includeActionItems: true,
  });

  return { meetings: result.items, nextCursor: result.nextCursor };
};
