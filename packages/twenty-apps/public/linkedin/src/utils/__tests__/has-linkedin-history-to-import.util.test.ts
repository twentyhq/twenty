import { describe, expect, it } from 'vitest';

import { hasLinkedinHistoryToImport } from 'src/utils/has-linkedin-history-to-import.util';

describe('hasLinkedinHistoryToImport', () => {
  it('has none when the member picks conversations and picked none', () => {
    expect(
      hasLinkedinHistoryToImport({
        importPolicy: 'SELECTED',
        selectedChats: [],
      }),
    ).toBe(false);
  });

  it('has the picked conversations', () => {
    expect(
      hasLinkedinHistoryToImport({
        importPolicy: 'SELECTED',
        selectedChats: [{ id: 'chat-1', name: 'Ada Lovelace' }],
      }),
    ).toBe(true);
  });

  it.each(['ALL', 'CONTACTS_ONLY'] as const)(
    'has the most recent conversations for the %s policy',
    (importPolicy) => {
      expect(
        hasLinkedinHistoryToImport({ importPolicy, selectedChats: [] }),
      ).toBe(true);
    },
  );
});
