import { isAgentChatDraftsByThreadId } from '@/ai/utils/isAgentChatDraftsByThreadId';
import { migrateAgentChatDraftsByThreadId } from '@/ai/utils/migrateAgentChatDraftsByThreadId';

describe('migrateAgentChatDraftsByThreadId', () => {
  it('keeps the text of drafts stored before they carried a record', () => {
    const migratedDrafts = migrateAgentChatDraftsByThreadId({
      'thread-1': '',
      'thread-2': { serializedDocument: '' },
    });

    expect(migratedDrafts).toEqual({
      'thread-1': { serializedDocument: '' },
      'thread-2': { serializedDocument: '' },
    });
    expect(isAgentChatDraftsByThreadId(migratedDrafts)).toBe(true);
  });

  it('gives up on anything that is not a draft map', () => {
    expect(migrateAgentChatDraftsByThreadId(['thread-1'])).toBeUndefined();
    expect(migrateAgentChatDraftsByThreadId('draft')).toBeUndefined();
  });
});
