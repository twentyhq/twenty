import { isNonEmptyString } from '@sniptt/guards';
import {
  type AskQuestionResponse,
  type AskQuestionToolInput,
  type AskQuestionToolResult,
} from 'twenty-shared/ai';
import { assertIsDefinedOrThrow, isNonEmptyArray } from 'twenty-shared/utils';
import { z } from 'zod';

import { definePausingTool } from 'src/engine/metadata-modules/ai/ai-agent-execution/pausing-tools/utils/define-pausing-tool.util';

export const askQuestionInputSchema = z.object({
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

// An application that asks through the inbox writes the same output.
export const buildAskQuestionPendingOutput = (
  question: AskQuestionToolInput,
): {
  success: true;
  message: string;
  result: AskQuestionToolResult;
} => ({
  success: true,
  message: 'Question presented to the user; awaiting their answer.',
  result: { question, status: 'pending' },
});

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
        .map((optionIndex) => {
          const option = question.options[optionIndex];

          assertIsDefinedOrThrow(option);

          return option.label;
        })
        .join(', ');

  return `${question.question}\n${value}`;
};

// result shape is read by the chat renderer, the admin panel and seeded runs
export const ASK_QUESTION_PAUSING_TOOL = definePausingTool<
  AskQuestionToolInput,
  AskQuestionResponse
>({
  inputSchema: askQuestionInputSchema,
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
