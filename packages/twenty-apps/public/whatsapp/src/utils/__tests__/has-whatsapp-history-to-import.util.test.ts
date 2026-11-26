import { describe, expect, it } from 'vitest';

import { hasWhatsappHistoryToImport } from 'src/utils/has-whatsapp-history-to-import.util';

describe('hasWhatsappHistoryToImport', () => {
  it('has none when the member picks conversations and picked none', () => {
    expect(
      hasWhatsappHistoryToImport({
        importPolicy: 'SELECTED',
        selectedChats: [],
      }),
    ).toBe(false);
  });

  it('has the picked conversations', () => {
    expect(
      hasWhatsappHistoryToImport({
        importPolicy: 'SELECTED',
        selectedChats: [{ id: 'chat-1', name: 'Ada Lovelace' }],
      }),
    ).toBe(true);
  });

  it.each(['ALL', 'CONTACTS_ONLY'] as const)(
    'has the most recent conversations for the %s policy',
    (importPolicy) => {
      expect(
        hasWhatsappHistoryToImport({ importPolicy, selectedChats: [] }),
      ).toBe(true);
    },
  );
});
