export const MICROSOFT_TENANT_ID_VARIABLE = 'MICROSOFT_TENANT_ID';
export const MICROSOFT_CLIENT_ID_VARIABLE = 'MICROSOFT_CLIENT_ID';
export const MICROSOFT_CLIENT_SECRET_VARIABLE = 'MICROSOFT_CLIENT_SECRET';
export const MICROSOFT_LOGIN_BASE_URL = 'https://login.microsoftonline.com';
export const MICROSOFT_GRAPH_BASE_URL = 'https://graph.microsoft.com/v1.0';
export const MICROSOFT_GRAPH_DEFAULT_SCOPE =
  'https://graph.microsoft.com/.default';
export const GRAPH_ACCESS_TOKEN_KEY_VALUE_KEY = 'teams-graph-access-token';
// Refresh well before Microsoft's expiry so a long transcript download never
// starts with a token that dies mid-request.
export const GRAPH_ACCESS_TOKEN_REFRESH_MARGIN_SECONDS = 5 * 60;
export const GRAPH_REQUEST_MAX_ATTEMPTS = 4;
export const GRAPH_REQUEST_RETRY_BASE_DELAY_MILLISECONDS = 1_000;
export const GRAPH_REQUEST_RETRY_MAX_DELAY_MILLISECONDS = 30_000;
export const GRAPH_TRANSCRIPT_LIST_PAGE_SIZE = 50;
export const MAX_GRAPH_TRANSCRIPT_LIST_PAGES = 200;
export const GRAPH_ATTRIBUTED_TRANSCRIPT_FORMAT = 'text/vtt';
export const GRAPH_UNATTRIBUTED_TRANSCRIPT_FORMAT =
  'application/vnd.microsoft.graph.transcript+text';
export const GRAPH_TRANSCRIPTS_DISABLED_ERROR_CODE =
  'GraphAccessToTranscriptsDisabled';
export const GRAPH_SPEAKER_ATTRIBUTION_DISABLED_ERROR_CODE =
  'SpeakerAttributionNotAllowed';
export const UNKNOWN_SPEAKER_LABEL = 'Speaker';
export const CALENDAR_EVENT_PAGE_SIZE = 200;
export const MAX_CALENDAR_EVENT_PAGES = 10;
export const CALENDAR_EVENT_MATCHING_WINDOW_MILLISECONDS = 5 * 60 * 1_000;
export const MILLISECONDS_PER_DAY = 24 * 60 * 60 * 1_000;
