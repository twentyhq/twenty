import { isNonEmptyString } from '@sniptt/guards';

import { ASK_AI_QUESTION_STARTER_WORDS } from '@/command-menu-item/constants/AskAiQuestionStarterWords';

const MINIMUM_WORD_COUNT_OF_A_QUESTION = 4;

export const doesSearchReadAsQuestion = (search: string): boolean => {
  const trimmedSearch = search.trim();

  if (!isNonEmptyString(trimmedSearch)) {
    return false;
  }

  if (trimmedSearch.endsWith('?')) {
    return true;
  }

  const firstWord = trimmedSearch.match(/^\w+/)?.[0].toLowerCase();

  if (
    isNonEmptyString(firstWord) &&
    ASK_AI_QUESTION_STARTER_WORDS.includes(firstWord)
  ) {
    return true;
  }

  return trimmedSearch.split(/\s+/).length >= MINIMUM_WORD_COUNT_OF_A_QUESTION;
};
