import { COMMAND_MENU_ASK_AI_FALLBACK_ITEM_ID } from '@/command-menu-item/constants/CommandMenuAskAiFallbackItemId';
import { getCommandMenuDefaultSelectedItemId } from '@/command-menu-item/display/utils/getCommandMenuDefaultSelectedItemId';

describe('getCommandMenuDefaultSelectedItemId', () => {
  it('selects nothing without a search', () => {
    expect(
      getCommandMenuDefaultSelectedItemId({
        trimmedSearch: '',
        firstCommandItemId: 'command',
        firstRecordItemId: 'record',
        shouldDisplayAskAiPrompt: true,
      }),
    ).toBeUndefined();
  });

  it('selects the first matching command before anything else', () => {
    expect(
      getCommandMenuDefaultSelectedItemId({
        trimmedSearch: 'how do I create a company?',
        firstCommandItemId: 'command',
        firstRecordItemId: 'record',
        shouldDisplayAskAiPrompt: true,
      }),
    ).toBe('command');
  });

  it.each(['acme?', 'who owns the acme deal'])(
    'selects Ask AI before records when "%s" reads as a question',
    (trimmedSearch) => {
      expect(
        getCommandMenuDefaultSelectedItemId({
          trimmedSearch,
          firstCommandItemId: undefined,
          firstRecordItemId: 'record',
          shouldDisplayAskAiPrompt: true,
        }),
      ).toBe(COMMAND_MENU_ASK_AI_FALLBACK_ITEM_ID);
    },
  );

  it('selects the first record when the search does not read as a question', () => {
    expect(
      getCommandMenuDefaultSelectedItemId({
        trimmedSearch: 'acme deal',
        firstCommandItemId: undefined,
        firstRecordItemId: 'record',
        shouldDisplayAskAiPrompt: true,
      }),
    ).toBe('record');
  });

  it('selects the first record for a question without the Ask AI prompt', () => {
    expect(
      getCommandMenuDefaultSelectedItemId({
        trimmedSearch: 'who owns the acme deal',
        firstCommandItemId: undefined,
        firstRecordItemId: 'record',
        shouldDisplayAskAiPrompt: false,
      }),
    ).toBe('record');
  });

  it('selects nothing when no command, question or record matches', () => {
    expect(
      getCommandMenuDefaultSelectedItemId({
        trimmedSearch: 'acme',
        firstCommandItemId: undefined,
        firstRecordItemId: undefined,
        shouldDisplayAskAiPrompt: true,
      }),
    ).toBeNull();
  });
});
