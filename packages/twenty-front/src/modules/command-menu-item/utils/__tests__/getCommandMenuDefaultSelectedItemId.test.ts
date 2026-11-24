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

  it('picks Ask AI over records when the search reads as a question', () => {
    expect(
      getCommandMenuDefaultSelectedItemId({
        isSearchActive: true,
        firstRecordItemId: 'record',
        askAiItemId: 'ask-ai',
        doesSearchReadAsQuestion: true,
      }),
    ).toBe('ask-ai');
  });

  it('falls back to the first record when no command matches and the search is not a question', () => {
    expect(
      getCommandMenuDefaultSelectedItemId({
        isSearchActive: true,
        firstRecordItemId: 'record',
        askAiItemId: 'ask-ai',
        doesSearchReadAsQuestion: false,
      }),
    ).toBe('record');
  });

  it('keeps records first when Ask AI is not offered', () => {
    expect(
      getCommandMenuDefaultSelectedItemId({
        isSearchActive: true,
        firstRecordItemId: 'record',
        doesSearchReadAsQuestion: true,
      }),
    ).toBe('record');
  });

  it('selects nothing when nothing matches and the search is not a question', () => {
    expect(
      getCommandMenuDefaultSelectedItemId({
        isSearchActive: true,
        askAiItemId: 'ask-ai',
        doesSearchReadAsQuestion: false,
      }),
    ).toBeNull();
  });
});
