import {
  type AskQuestionItem,
  type AskQuestionResponse,
  type AskQuestionToolResult,
  type AskQuestionsToolResult,
} from 'twenty-shared/ai';
import { isDefined } from 'twenty-shared/utils';

type AskedQuestionEntry = {
  question: AskQuestionItem;
  answer?: AskQuestionResponse;
};

// calls asked before ask_question carry a list of questions and answers
export const getAskedQuestionEntries = (
  result: AskQuestionToolResult | AskQuestionsToolResult | undefined,
): AskedQuestionEntry[] => {
  if (!isDefined(result)) {
    return [];
  }

  if ('question' in result) {
    return [{ question: result.question, answer: result.answer }];
  }

  return result.questions.map((question, questionIndex) => ({
    question,
    answer: result.answers?.find(
      (answer) => answer.questionIndex === questionIndex,
    ),
  }));
};
