import { type Fathom } from 'fathom-typescript';
import { type Meeting } from 'fathom-typescript/sdk/models/shared';

export type AccessibleFathomMeetingPage = {
  meetings: Meeting[];
  nextCursor: string | null;
};

export const listAccessibleFathomMeetingPage = async ({
  fathomClient,
  createdAfter,
  cursor,
}: {
  fathomClient: Pick<Fathom, 'listMeetings'>;
  createdAfter: string;
  cursor?: string;
}): Promise<AccessibleFathomMeetingPage> => {
  const meetingPages = await fathomClient.listMeetings({
    createdAfter,
    cursor,
    includeActionItems: true,
  });

  for await (const meetingPage of meetingPages) {
    return {
      meetings: meetingPage.result.items,
      nextCursor: meetingPage.result.nextCursor,
    };
  }

  return { meetings: [], nextCursor: null };
};
