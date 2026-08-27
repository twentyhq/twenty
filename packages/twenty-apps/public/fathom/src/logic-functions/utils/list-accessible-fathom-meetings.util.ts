import { type Fathom } from 'fathom-typescript';
import { type Meeting } from 'fathom-typescript/sdk/models/shared';

export const listAccessibleFathomMeetings = async ({
  fathomClient,
  createdAfter,
  stopWhen,
}: {
  fathomClient: Pick<Fathom, 'listMeetings'>;
  createdAfter?: string;
  stopWhen?: (meetings: Meeting[]) => boolean;
}): Promise<Meeting[]> => {
  const meetings: Meeting[] = [];
  const meetingPages = await fathomClient.listMeetings({
    createdAfter,
    includeActionItems: true,
  });

  for await (const meetingPage of meetingPages) {
    meetings.push(...meetingPage.result.items);

    if (stopWhen?.(meetings)) {
      break;
    }
  }

  return meetings;
};
