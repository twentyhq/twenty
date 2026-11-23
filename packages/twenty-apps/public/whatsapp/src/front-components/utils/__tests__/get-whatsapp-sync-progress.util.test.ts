import { describe, expect, it } from 'vitest';

import { getWhatsappSyncProgress } from 'src/front-components/utils/get-whatsapp-sync-progress.util';
import { type WhatsappHistoryImportState } from 'src/types/whatsapp-history-import-state.type';

const buildHistoryImport = (
  overrides: Partial<WhatsappHistoryImportState>,
): WhatsappHistoryImportState => ({
  runId: 'run-1',
  importPolicy: 'ALL',
  conversationLimit: 20,
  status: 'IMPORTING',
  importedConversationCount: 0,
  processedConversationCount: 0,
  startedAt: '2026-10-30T00:00:00.000Z',
  ...overrides,
});

describe('getWhatsappSyncProgress', () => {
  it('returns the share of processed conversations', () => {
    expect(
      getWhatsappSyncProgress(
        buildHistoryImport({
          processedConversationCount: 214,
          totalConversationCount: 510,
        }),
      ),
    ).toBe(41);
  });

  it('never reaches 100% while the run is going', () => {
    expect(
      getWhatsappSyncProgress(
        buildHistoryImport({
          processedConversationCount: 510,
          totalConversationCount: 510,
        }),
      ),
    ).toBe(99);
  });

  it('is unknown when WhatsApp gave no total', () => {
    expect(
      getWhatsappSyncProgress(
        buildHistoryImport({ processedConversationCount: 40 }),
      ),
    ).toBeUndefined();
  });
});
