// Per IP on the public consent lookup; only fetches count, and ChatGPT's and Claude's documents refetch at most every 5 minutes each
export const CLIENT_ID_METADATA_DOCUMENT_FETCH_RATE_LIMIT_MAX = 60;
export const CLIENT_ID_METADATA_DOCUMENT_FETCH_RATE_LIMIT_WINDOW_MS =
  60 * 60 * 1000;
