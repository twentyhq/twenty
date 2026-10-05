export type DownloadTranscriptResult =
  | { outcome: 'filled'; content: unknown }
  | { outcome: 'failed'; subCode: string | null }
  | { outcome: 'pending' }
  | { outcome: 'deleted' }
  | { outcome: 'error'; errorMessage: string };
