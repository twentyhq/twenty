import { SIDE_PANEL_SEARCH_AI_ANSWER_AUTOMATIC_MIN_WORD_COUNT } from '@/side-panel/pages/search/constants/SidePanelSearchAiAnswerAutomaticMinWordCount';
import { SIDE_PANEL_SEARCH_QUESTION_WORDS } from '@/side-panel/pages/search/constants/SidePanelSearchQuestionWords';

const QUESTION_MARK_PATTERN = /[?？¿]/;

export const isEligibleForAutomaticSidePanelSearchAiAnswer = (
  query: string,
) => {
  const words = query.trim().split(/\s+/).filter(Boolean);

  if (words.length >= SIDE_PANEL_SEARCH_AI_ANSWER_AUTOMATIC_MIN_WORD_COUNT) {
    return true;
  }

  if (QUESTION_MARK_PATTERN.test(query)) {
    return true;
  }

  return (
    words.length >= 2 &&
    SIDE_PANEL_SEARCH_QUESTION_WORDS.has(words[0].toLocaleLowerCase())
  );
};
