import { type RECALL_ASYNC_TRANSCRIPT_PROVIDERS } from 'src/logic-functions/constants/RECALL_ASYNC_TRANSCRIPT_PROVIDERS';

export type RecallAsyncTranscriptProvider =
  keyof typeof RECALL_ASYNC_TRANSCRIPT_PROVIDERS;
