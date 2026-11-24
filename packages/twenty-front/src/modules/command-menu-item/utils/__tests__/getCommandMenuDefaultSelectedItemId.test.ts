import { getCommandMenuDefaultSelectedItemId } from '@/command-menu-item/utils/getCommandMenuDefaultSelectedItemId';

describe('getCommandMenuDefaultSelectedItemId', () => {
  it('leaves the default to the list while idle', () => {
    expect(
      getCommandMenuDefaultSelectedItemId({
        isSearchActive: false,
        firstCommandItemId: 'command',
        askAiItemId: 'ask-ai',
        doesSearchReadAsQuestion: false,
      }),
    ).toBeUndefined();
  });

  it('prefers the first matching command', () => {
    expect(
      getCommandMenuDefaultSelectedItemId({
        isSearchActive: true,
        firstCommandItemId: 'command',
        firstRecordItemId: 'record',
        askAiItemId: 'ask-ai',
        doesSearchReadAsQuestion: true,
      }),
    ).toBe('command');
  });

  it('falls back to the first record when no command matches', () => {
    expect(
      getCommandMenuDefaultSelectedItemId({
        isSearchActive: true,
        firstRecordItemId: 'record',
        askAiItemId: 'ask-ai',
        doesSearchReadAsQuestion: true,
      }),
    ).toBe('record');
  });

  it('picks Ask AI only when the search reads as a question', () => {
    expect(
      getCommandMenuDefaultSelectedItemId({
        isSearchActive: true,
        askAiItemId: 'ask-ai',
        doesSearchReadAsQuestion: true,
      }),
    ).toBe('ask-ai');

    expect(
      getCommandMenuDefaultSelectedItemId({
        isSearchActive: true,
        askAiItemId: 'ask-ai',
        doesSearchReadAsQuestion: false,
      }),
    ).toBeNull();
  });
});
