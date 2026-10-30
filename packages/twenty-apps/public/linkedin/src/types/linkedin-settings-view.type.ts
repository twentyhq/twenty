import { type LinkedinHistoryImportState } from 'src/types/linkedin-history-import-state.type';
import { type LinkedinPersonReview } from 'src/types/linkedin-person-review.type';
import { type LinkedinPersonReviewCandidate } from 'src/types/linkedin-person-review-candidate.type';
import { type LinkedinSettings } from 'src/types/linkedin-settings.type';

export type LinkedinSettingsView =
  | { isConnected: false }
  | {
      isConnected: true;
      connection: { name: string; handle: string; isAuthFailed: boolean };
      settings: LinkedinSettings;
      historyImport: LinkedinHistoryImportState | null;
      personReviews: (Omit<LinkedinPersonReview, 'candidatePersonIds'> & {
        candidates: LinkedinPersonReviewCandidate[];
      })[];
    };
