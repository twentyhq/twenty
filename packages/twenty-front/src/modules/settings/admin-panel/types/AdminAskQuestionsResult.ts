import { type AskQuestionAnswer, type AskQuestionItem } from 'twenty-shared/ai';

export type AdminAskQuestionsResult = {
  questions: AskQuestionItem[];
  status: string;
  answers?: AskQuestionAnswer[];
};
