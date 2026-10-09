import { type TeamsTranscriptHistoryImportEstimate } from 'src/features/transcripts/front-components/types/teams-transcript-history-import-estimate.type';
import { type TeamsTranscriptHistoryErrorCode } from 'src/features/transcripts/logic-functions/types/teams-transcript-history-error-code.type';

export type TeamsTranscriptHistoryView =
  | { kind: 'idle' }
  | { kind: 'stalled' }
  | { kind: 'failed'; errorCode: TeamsTranscriptHistoryErrorCode }
  | { kind: 'counting'; checkedThrough?: string }
  | {
      kind: 'counted';
      runId: string;
      days: number;
      transcriptCount: number;
      alreadyImportedCount: number;
      deletedCount: number;
      toImportCount: number;
      importEstimate: TeamsTranscriptHistoryImportEstimate;
    }
  | {
      kind: 'importing' | 'imported';
      importedCount: number;
      skippedCount: number;
      unavailableCount: number;
      toImportCount?: number;
      checkedThrough?: string;
    };
