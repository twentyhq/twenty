export interface ImportSummary {
  fileName: string;
  status: 'success' | 'failed' | 'skipped';
  message: string;
}
