import { describe, expect, it } from 'vitest';

import { hasLinkedinHistoryToImport } from 'src/utils/has-linkedin-history-to-import.util';

describe('hasLinkedinHistoryToImport', () => {
  it('has none when the member picks conversations and picked none', () => {
    expect(
      hasLinkedinHistoryToImport({
        importPolicy: 'SELECTED',
        selectedChats: [],
        historyConversationLimit: 50,
      }),
    ).toBe(false);
  });

  it('has the picked conversations, even with past conversations turned off', () => {
    expect(
      hasLinkedinHistoryToImport({
        importPolicy: 'SELECTED',
        selectedChats: [{ id: 'chat-1', name: 'Ada Lovelace' }],
        historyConversationLimit: 0,
      }),
    ).toBe(true);
  });

  it('follows the past conversations setting for the other policies', () => {
    expect(
      hasLinkedinHistoryToImport({
        importPolicy: 'ALL',
        selectedChats: [{ id: 'chat-1', name: 'Ada Lovelace' }],
        historyConversationLimit: 0,
      }),
    ).toBe(false);
    expect(
      hasLinkedinHistoryToImport({
        importPolicy: 'CONTACTS_ONLY',
        selectedChats: [],
        historyConversationLimit: 50,
      }),
    ).toBe(true);
  });
});
