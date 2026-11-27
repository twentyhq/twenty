import { COMMAND_MENU_ASK_AI_FALLBACK_ITEM_ID } from '@/command-menu-item/constants/CommandMenuAskAiFallbackItemId';
import { isNonEmptyString } from '@sniptt/guards';
import { isDefined } from 'twenty-shared/utils';

const MINIMUM_QUESTION_WORD_COUNT = 4;

export const getCommandMenuDefaultSelectedItemId = ({
  trimmedSearch,
  firstCommandItemId,
  firstRecordItemId,
  shouldDisplayAskAiPrompt,
}: {
  trimmedSearch: string;
  firstCommandItemId: string | undefined;
  firstRecordItemId: string | undefined;
  shouldDisplayAskAiPrompt: boolean;
}) => {
  if (!isNonEmptyString(trimmedSearch)) {
    return undefined;
  }

  if (isDefined(firstCommandItemId)) {
    return firstCommandItemId;
  }

  const doesSearchReadAsQuestion =
    trimmedSearch.endsWith('?') ||
    trimmedSearch.split(/\s+/).length >= MINIMUM_QUESTION_WORD_COUNT;

  if (shouldDisplayAskAiPrompt && doesSearchReadAsQuestion) {
    return COMMAND_MENU_ASK_AI_FALLBACK_ITEM_ID;
  }

  if (isDefined(firstRecordItemId)) {
    return firstRecordItemId;
  }

  return null;
};
