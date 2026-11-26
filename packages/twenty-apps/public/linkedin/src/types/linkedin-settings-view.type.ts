import { type LinkedinConnectionSummary } from 'src/types/linkedin-connection-summary.type';
import { type LinkedinHistoryImportState } from 'src/types/linkedin-history-import-state.type';
import { type LinkedinSettings } from 'src/types/linkedin-settings.type';
import { type LinkedinVisibility } from 'src/types/linkedin-visibility.type';

export type LinkedinSettingsView =
  | { isConnected: false }
  | {
      isConnected: true;
      connection: LinkedinConnectionSummary;
      connections: LinkedinConnectionSummary[];
      settings: LinkedinSettings & { visibility: LinkedinVisibility };
      historyImport: LinkedinHistoryImportState | null;
    };
