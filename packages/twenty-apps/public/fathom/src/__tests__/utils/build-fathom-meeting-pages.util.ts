import { type Meeting } from 'fathom-typescript/sdk/models/shared';

// Mirrors listMeetings: the page for a cursor is the response itself, and each
// page names the cursor of the next one.
export const buildFathomMeetingPages =
  (meetingPages: Meeting[][]) =>
  async ({ cursor }: { cursor?: string }) => {
    const pageIndex = cursor === undefined ? 0 : Number(cursor);
    const isLastPage = pageIndex >= meetingPages.length - 1;

    return {
      result: {
        items: meetingPages[pageIndex] ?? [],
        limit: null,
        nextCursor: isLastPage ? null : String(pageIndex + 1),
      },
    };
  };
