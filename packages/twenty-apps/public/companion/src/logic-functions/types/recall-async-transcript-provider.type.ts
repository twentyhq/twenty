import { type RECALL_ASYNC_TRANSCRIPT_PROVIDERS } from 'src/logic-functions/constants/recall-async-transcript-providers';

export type RecallAsyncTranscriptProvider =
  keyof typeof RECALL_ASYNC_TRANSCRIPT_PROVIDERS;
