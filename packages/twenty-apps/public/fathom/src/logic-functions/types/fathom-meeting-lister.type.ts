import { type ListMeetingsRequest } from 'fathom-typescript/sdk/models/operations';
import { type MeetingListResponse } from 'fathom-typescript/sdk/models/shared';

// The page utilities read one response at a time, so a test double does not
// have to implement the SDK's async page iterator.
export type FathomMeetingLister = {
  listMeetings: (
    request: ListMeetingsRequest,
  ) => Promise<{ result: MeetingListResponse }>;
};
