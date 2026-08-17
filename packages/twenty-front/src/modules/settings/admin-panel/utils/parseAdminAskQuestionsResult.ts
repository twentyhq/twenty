import { isArray, isBoolean, isNumber, isString } from '@sniptt/guards';
import {
  ASK_QUESTIONS_TOOL_NAME,
  type AskQuestionAnswer,
  type AskQuestionItem,
  type AskQuestionOption,
  type AskQuestionsToolResult,
  type AskQuestionsToolStatus,
} from 'twenty-shared/ai';
import { isDefined, isPlainObject } from 'twenty-shared/utils';

import { type AdminChatThreadMessagePart } from '@/settings/admin-panel/types/AdminChatThreadMessagePart';
import { getAdminToolDisplayName } from '@/settings/admin-panel/utils/getAdminToolDisplayName';
import { parseAdminToolJson } from '@/settings/admin-panel/utils/parseAdminToolJson';

const ASK_QUESTIONS_TOOL_STATUSES: AskQuestionsToolStatus[] = [
  'pending',
  'answered',
  'skipped',
];

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

const parseAnswer = (value: unknown): AskQuestionAnswer | null => {
  if (
    !isPlainObject(value) ||
    !isNumber(value.questionIndex) ||
    !isArray(value.selectedOptionIndices)
  ) {
    return null;
  }

  return {
    questionIndex: value.questionIndex,
    selectedOptionIndices: value.selectedOptionIndices.filter(isNumber),
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

const parseStatus = (value: unknown): AskQuestionsToolStatus =>
  ASK_QUESTIONS_TOOL_STATUSES.find((status) => status === value) ?? 'pending';

const parseAnswers = (value: unknown): AskQuestionAnswer[] | undefined =>
  isArray(value) ? value.map(parseAnswer).filter(isDefined) : undefined;

const parseResultFromToolOutput = (
  toolOutput: unknown,
): AskQuestionsToolResult | null => {
  if (!isPlainObject(toolOutput) || !isPlainObject(toolOutput.result)) {
    return null;
  }

  const questions = parseQuestions(toolOutput.result.questions);

  if (!isDefined(questions)) {
    return null;
  }

  return {
    questions,
    status: parseStatus(toolOutput.result.status),
    answers: parseAnswers(toolOutput.result.answers),
  };
};

const parseResultFromToolInput = (
  toolInput: unknown,
): AskQuestionsToolResult | null => {
  if (!isPlainObject(toolInput)) {
    return null;
  }

  const questions = parseQuestions(toolInput.questions);

  return isDefined(questions) ? { questions, status: 'pending' } : null;
};

export const parseAdminAskQuestionsResult = (
  part: AdminChatThreadMessagePart,
): AskQuestionsToolResult | null => {
  if (getAdminToolDisplayName(part) !== ASK_QUESTIONS_TOOL_NAME) {
    return null;
  }

  return (
    parseResultFromToolOutput(parseAdminToolJson(part.toolOutput)) ??
    parseResultFromToolInput(parseAdminToolJson(part.toolInput))
  );
};
