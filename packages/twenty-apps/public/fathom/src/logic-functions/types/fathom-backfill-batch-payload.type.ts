import { type SerializedFathomMeeting } from 'src/logic-functions/types/serialized-fathom-meeting.type';

export type FathomBackfillBatchPayload = {
  connectedAccountId: string;
  meetings: SerializedFathomMeeting[];
  requeueAttempt?: number;
};
