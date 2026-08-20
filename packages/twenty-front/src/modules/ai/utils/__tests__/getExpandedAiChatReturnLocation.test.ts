import { getExpandedAiChatReturnLocation } from '@/ai/utils/getExpandedAiChatReturnLocation';

describe('getExpandedAiChatReturnLocation', () => {
  it('should return the location the chat was expanded from', () => {
    expect(
      getExpandedAiChatReturnLocation({
        returnLocation: '/objects/people?viewId=1#top',
      }),
    ).toBe('/objects/people?viewId=1#top');
  });

  it.each([
    ['no history state', null],
    ['a history state without a return location', { other: '/objects/people' }],
    ['a non-string return location', { returnLocation: 42 }],
    ['an absolute url', { returnLocation: 'https://evil.example.com' }],
    ['a protocol-relative url', { returnLocation: '//evil.example.com' }],
    ['a backslash escape', { returnLocation: '/objects\\..\\people' }],
    ['an onboarding path', { returnLocation: '/create/profile' }],
  ])('should return null for %s', (_case, historyState) => {
    expect(getExpandedAiChatReturnLocation(historyState)).toBeNull();
  });
});
