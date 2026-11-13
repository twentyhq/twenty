import { mergeInboxThreadListIds } from '@/ai/utils/mergeAgentChatThreadListIds';

describe('mergeInboxThreadListIds', () => {
  it('replaces the list on refresh, keeping chats added while it ran', () => {
    expect(
      mergeInboxThreadListIds({
        mode: 'refresh',
        threadIdsBeforeRequest: ['old', 'kept-by-page'],
        currentThreadIds: ['added', 'old', 'kept-by-page'],
        pageThreadIds: ['kept-by-page', 'new'],
      }),
    ).toEqual(['added', 'kept-by-page', 'new']);
  });

  it('appends the next page after the current list without duplicates', () => {
    expect(
      mergeInboxThreadListIds({
        mode: 'fetch-more',
        threadIdsBeforeRequest: ['first'],
        currentThreadIds: ['added', 'first'],
        pageThreadIds: ['first', 'second'],
      }),
    ).toEqual(['added', 'first', 'second']);
  });
});
