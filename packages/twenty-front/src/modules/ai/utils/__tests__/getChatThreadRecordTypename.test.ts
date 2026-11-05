import { getChatThreadRecordTypename } from '@/ai/utils/getChatThreadRecordTypename';

describe('getChatThreadRecordTypename', () => {
  it('uses renamed metadata instead of stale record typenames', () => {
    expect(
      getChatThreadRecordTypename({
        objectNameSingular: 'inboxThread',
        currentRecordTypename: 'AgentChatThread',
        updateRecordTypename: 'AgentChatThread',
      }),
    ).toBe('InboxThread');
  });

  it('preserves the known record typename while metadata loads', () => {
    expect(
      getChatThreadRecordTypename({
        currentRecordTypename: 'InboxThread',
        updateRecordTypename: 'AgentChatThread',
      }),
    ).toBe('InboxThread');
  });

  it('uses a typed update for a record not loaded yet', () => {
    expect(
      getChatThreadRecordTypename({ updateRecordTypename: 'InboxThread' }),
    ).toBe('InboxThread');
  });

  it('does not invent a typename without metadata or a typed record', () => {
    expect(getChatThreadRecordTypename({})).toBeUndefined();
  });
});
