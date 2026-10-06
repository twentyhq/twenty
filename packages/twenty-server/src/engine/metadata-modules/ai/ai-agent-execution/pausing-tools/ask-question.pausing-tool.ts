import { isNonEmptyString } from '@sniptt/guards';
import {
  type AskQuestionResponse,
  type AskQuestionToolInput,
  type AskQuestionToolResult,
} from 'twenty-shared/ai';
import { isNonEmptyArray } from 'twenty-shared/utils';
import { z } from 'zod';

import { definePausingTool } from 'src/engine/metadata-modules/ai/ai-agent-execution/pausing-tools/utils/define-pausing-tool.util';

const askQuestionInputSchema = z.object({
  header: z
    .string()
    .describe(
      'Very short label/tag for the question (≤ ~32 chars), e.g. "Email type".',
    ),
  question: z
    .string()
    .describe('The full question to ask the user. Be clear and specific.'),
  options: z
    .array(
      z.object({
        label: z
          .string()
          .trim()
          .min(1)
          .describe('Concise option the user can pick (1-5 words).'),
        description: z
          .string()
          .optional()
          .describe(
            'Longer explanation shown when the user opens the option info icon.',
          ),
        isRecommended: z
          .boolean()
          .optional()
          .describe('Mark the single suggested option, if any.'),
      }),
    )
    .min(2)
    .max(4)
    .refine(
      (options) =>
        options.filter((option) => option.isRecommended === true).length <= 1,
      { message: 'At most one option can be marked as recommended.' },
    )
    .describe('2-4 mutually exclusive options.'),
  allowMultiSelect: z
    .boolean()
    .optional()
    .describe('Allow the user to select more than one option.'),
});

const SEVERAL_QUESTIONS_GUIDANCE =
  'To ask several questions, call it once per question in the same step: the user goes ' +
  'through them one by one and the conversation continues once all are answered.';

// a workspace setup conversation is the user's to steer, so any decision of theirs is worth asking
export const WORKSPACE_SETUP_ASK_QUESTION_DESCRIPTION =
  'Ask the user a multiple-choice question when a decision is theirs to make. The ' +
  'conversation pauses until the user answers, then continues with their choice in mind. ' +
  'Do NOT use it for information you could look up with another tool. The user can always ' +
  `type a free-form answer instead of picking an option. ${SEVERAL_QUESTIONS_GUIDANCE}`;

const buildAskQuestionOutputSchema = (
  question: AskQuestionToolInput,
): z.ZodType<AskQuestionResponse> =>
  z
    .object({
      selectedOptionIndices: z
        .array(z.number().int())
        .refine((indices) => new Set(indices).size === indices.length, {
          message: 'Each option can be selected only once.',
        }),
      freeText: z.string().optional(),
    })
    .superRefine(({ selectedOptionIndices, freeText }, context) => {
      if (
        selectedOptionIndices.some(
          (optionIndex) =>
            optionIndex < 0 || optionIndex >= question.options.length,
        )
      ) {
        context.addIssue({
          code: 'custom',
          message: 'The answer references an unknown option.',
        });
      }

      if (
        question.allowMultiSelect !== true &&
        selectedOptionIndices.length > 1
      ) {
        context.addIssue({
          code: 'custom',
          message: 'This question allows only one selection.',
        });
      }

      if (
        !isNonEmptyString(freeText?.trim()) &&
        !isNonEmptyArray(selectedOptionIndices)
      ) {
        context.addIssue({ code: 'custom', message: 'Provide an answer.' });
      }
    });

const buildAnswerText = ({
  question,
  answer,
}: {
  question: AskQuestionToolInput;
  answer: AskQuestionResponse;
}) => {
  const freeText = answer.freeText?.trim();
  const value = isNonEmptyString(freeText)
    ? freeText
    : answer.selectedOptionIndices
        .map((optionIndex) => question.options[optionIndex].label)
        .join(', ');

  return `${question.question}\n${value}`;
};

// result shape is read by the chat renderer, the admin panel and seeded runs
export const ASK_QUESTION_PAUSING_TOOL = definePausingTool<
  AskQuestionToolInput,
  AskQuestionResponse
>({
  description:
    'Ask the user a multiple-choice question when you need a decision you cannot infer ' +
    'from the request or context and that has no obvious default. The conversation pauses ' +
    'until the user answers, then continues with their choice in mind. Prefer this over ' +
    'guessing on consequential or ambiguous decisions. Do NOT use it for information you ' +
    'could look up with another tool, or for trivial choices with an obvious default. The ' +
    `user can always type a free-form answer instead of picking an option. ${SEVERAL_QUESTIONS_GUIDANCE}`,
  inputSchema: askQuestionInputSchema,
  prepare: async (question) => ({ pendingResult: { question } }),
  preview: (question) => question.question,
  outputSchema: buildAskQuestionOutputSchema,
  complete: async ({ output: answer, input: question }) => ({
    toolResult: {
      success: true,
      message: 'User answered the question.',
      result: {
        question,
        status: 'answered',
        answer,
      } satisfies AskQuestionToolResult,
    },
    answerText: buildAnswerText({ question, answer }),
  }),
  toSkippedToolResult: (question) => ({
    success: true,
    message: 'User skipped the question and sent another message instead.',
    result: { question, status: 'skipped' } satisfies AskQuestionToolResult,
  }),
});
