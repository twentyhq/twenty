import { describe, expect, it } from 'vitest';

import { hasWhatsappHistoryToImport } from 'src/utils/has-whatsapp-history-to-import.util';

describe('hasWhatsappHistoryToImport', () => {
  it('has none when the member picks conversations and picked none', () => {
    expect(
      hasWhatsappHistoryToImport({
        importPolicy: 'SELECTED',
        selectedChats: [],
        historyConversationLimit: 50,
      }),
    ).toBe(false);
  });

  it('has the picked conversations, even with past conversations turned off', () => {
    expect(
      hasWhatsappHistoryToImport({
        importPolicy: 'SELECTED',
        selectedChats: [{ id: 'chat-1', name: 'Ada Lovelace' }],
        historyConversationLimit: 0,
      }),
    ).toBe(true);
  });

  it('follows the past conversations setting for the other policies', () => {
    expect(
      hasWhatsappHistoryToImport({
        importPolicy: 'ALL',
        selectedChats: [{ id: 'chat-1', name: 'Ada Lovelace' }],
        historyConversationLimit: 0,
      }),
    ).toBe(false);
    expect(
      hasWhatsappHistoryToImport({
        importPolicy: 'CONTACTS_ONLY',
        selectedChats: [],
        historyConversationLimit: 50,
      }),
    ).toBe(true);
  });
});
