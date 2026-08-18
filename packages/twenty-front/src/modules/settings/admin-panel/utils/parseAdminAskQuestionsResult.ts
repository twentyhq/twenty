import { isArray, isBoolean, isNumber, isString } from '@sniptt/guards';
import {
  ASK_QUESTIONS_TOOL_NAME,
  type AskQuestionAnswer,
  type AskQuestionItem,
  type AskQuestionOption,
} from 'twenty-shared/ai';
import { isDefined, isPlainObject } from 'twenty-shared/utils';

import { type AdminAskQuestionsResult } from '@/settings/admin-panel/types/AdminAskQuestionsResult';
import { type AdminChatThreadMessagePart } from '@/settings/admin-panel/types/AdminChatThreadMessagePart';
import { getAdminToolDisplayName } from '@/settings/admin-panel/utils/getAdminToolDisplayName';
import { parseAdminToolJson } from '@/settings/admin-panel/utils/parseAdminToolJson';

const parseOption = (value: unknown): AskQuestionOption | null => {
  if (!isPlainObject(value) || !isString(value.label)) {
    return null;
  }

  return {
    label: value.label,
    description: isString(value.description) ? value.description : undefined,
    isRecommended: isBoolean(value.isRecommended)
      ? value.isRecommended
      : undefined,
  };
};

const parseQuestion = (value: unknown): AskQuestionItem | null => {
  if (
    !isPlainObject(value) ||
    !isString(value.question) ||
    !isArray(value.options)
  ) {
    return null;
  }

  const options = value.options.map(parseOption).filter(isDefined);

  if (options.length !== value.options.length) {
    return null;
  }

  return {
    header: isString(value.header) ? value.header : '',
    question: value.question,
    options,
    allowMultiSelect: isBoolean(value.allowMultiSelect)
      ? value.allowMultiSelect
      : undefined,
  };
};

const parseAnswer = (
  value: unknown,
  questions: AskQuestionItem[],
): AskQuestionAnswer | null => {
  if (
    !isPlainObject(value) ||
    !isNumber(value.questionIndex) ||
    !isArray(value.selectedOptionIndices)
  ) {
    return null;
  }

  const question = questions[value.questionIndex];

  if (!isDefined(question)) {
    return null;
  }

  const selectedOptionIndices = value.selectedOptionIndices.filter(isNumber);

  if (selectedOptionIndices.length !== value.selectedOptionIndices.length) {
    return null;
  }

  const hasOutOfRangeOption = selectedOptionIndices.some(
    (optionIndex) => optionIndex < 0 || optionIndex >= question.options.length,
  );

  if (hasOutOfRangeOption) {
    return null;
  }

  return {
    questionIndex: value.questionIndex,
    selectedOptionIndices,
    freeText: isString(value.freeText) ? value.freeText : undefined,
  };
};

const parseQuestions = (value: unknown): AskQuestionItem[] | null => {
  if (!isArray(value)) {
    return null;
  }

  const questions = value.map(parseQuestion).filter(isDefined);

  return questions.length === value.length ? questions : null;
};

const parseAnswers = (
  value: unknown,
  questions: AskQuestionItem[],
): AskQuestionAnswer[] | null => {
  if (!isArray(value)) {
    return null;
  }

  const answers = value
    .map((answer) => parseAnswer(answer, questions))
    .filter(isDefined);

  return answers.length === value.length ? answers : null;
};

const getStoredResult = (toolOutput: unknown): Record<string, unknown> | null =>
  isPlainObject(toolOutput) && isPlainObject(toolOutput.result)
    ? toolOutput.result
    : null;

const parseStoredResult = (
  result: Record<string, unknown>,
): AdminAskQuestionsResult | null => {
  const questions = parseQuestions(result.questions);

  if (!isDefined(questions)) {
    return null;
  }

  const status = isString(result.status) ? result.status : 'pending';

  if (!isDefined(result.answers)) {
    return { questions, status };
  }

  const answers = parseAnswers(result.answers, questions);

  return isDefined(answers) ? { questions, status, answers } : null;
};

const parsePendingResultFromToolInput = (
  toolInput: unknown,
): AdminAskQuestionsResult | null => {
  if (!isPlainObject(toolInput)) {
    return null;
  }

  const questions = parseQuestions(toolInput.questions);

  return isDefined(questions) ? { questions, status: 'pending' } : null;
};

export const parseAdminAskQuestionsResult = (
  part: AdminChatThreadMessagePart,
): AdminAskQuestionsResult | null => {
  if (getAdminToolDisplayName(part) !== ASK_QUESTIONS_TOOL_NAME) {
    return null;
  }

  const storedResult = getStoredResult(parseAdminToolJson(part.toolOutput));

  if (isDefined(storedResult)) {
    return parseStoredResult(storedResult);
  }

  return parsePendingResultFromToolInput(parseAdminToolJson(part.toolInput));
};
