import { BLOCK_NOTE_SUGGESTION_MENU_ID } from '@/blocknote-editor/constants/BlockNoteSuggestionMenuId';

export const getBlockNoteSuggestionMenuItemId = (index: number) =>
  `${BLOCK_NOTE_SUGGESTION_MENU_ID}-item-${index}`;
