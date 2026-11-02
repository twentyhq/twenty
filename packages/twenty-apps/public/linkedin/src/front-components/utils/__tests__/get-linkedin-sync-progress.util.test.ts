import { describe, expect, it } from 'vitest';

import { formatLinkedinSyncProgressLabel } from 'src/front-components/utils/format-linkedin-sync-progress-label.util';
import { getLinkedinSyncProgress } from 'src/front-components/utils/get-linkedin-sync-progress.util';
import { type LinkedinHistoryImportState } from 'src/types/linkedin-history-import-state.type';

const buildHistoryImport = (
  overrides: Partial<LinkedinHistoryImportState>,
): LinkedinHistoryImportState => ({
  runId: 'run-1',
  importPolicy: 'ALL',
  status: 'IMPORTING',
  importedConversationCount: 0,
  processedConversationCount: 0,
  startedAt: '2026-10-30T00:00:00.000Z',
  ...overrides,
});

describe('getLinkedinSyncProgress', () => {
  it('returns the share of processed conversations', () => {
    expect(
      getLinkedinSyncProgress(
        buildHistoryImport({
          processedConversationCount: 214,
          totalConversationCount: 510,
        }),
      ),
    ).toBe(41);
  });

  it('never reaches 100% while the run is going', () => {
    expect(
      getLinkedinSyncProgress(
        buildHistoryImport({
          processedConversationCount: 510,
          totalConversationCount: 510,
        }),
      ),
    ).toBe(99);
  });

  it('is unknown when LinkedIn gave no total', () => {
    expect(
      getLinkedinSyncProgress(
        buildHistoryImport({ processedConversationCount: 40 }),
      ),
    ).toBeUndefined();
  });
});

describe('formatLinkedinSyncProgressLabel', () => {
  it('pads single digits so the label keeps its width', () => {
    expect(formatLinkedinSyncProgressLabel(7)).toBe(' (7%)');
    expect(formatLinkedinSyncProgressLabel(42)).toBe('(42%)');
  });
});
