import { isNonEmptyString } from '@sniptt/guards';
import {
  type AskQuestionAnswer,
  type AskQuestionsToolInput,
  type AskQuestionsToolResult,
} from 'twenty-shared/ai';
import {
  assertIsDefinedOrThrow,
  isDefined,
  isNonEmptyArray,
} from 'twenty-shared/utils';
import { z } from 'zod';

import { definePausingTool } from 'src/engine/metadata-modules/ai/ai-agent-execution/pausing-tools/utils/define-pausing-tool.util';

const askQuestionsInputSchema = z.object({
  questions: z
    .array(
      z.object({
        header: z
          .string()
          .describe(
            'Very short label/tag for the question (≤ ~32 chars), e.g. "Email type".',
          ),
        question: z
          .string()
          .describe(
            'The full question to ask the user. Be clear and specific.',
          ),
        options: z
          .array(
            z.object({
              label: z
                .string()
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
              options.filter((option) => option.isRecommended === true)
                .length <= 1,
            { message: 'At most one option can be marked as recommended.' },
          )
          .describe('2-4 mutually exclusive options.'),
        allowMultiSelect: z
          .boolean()
          .optional()
          .describe('Allow the user to select more than one option.'),
      }),
    )
    .min(1)
    .max(4)
    .describe('One to four questions to ask the user.'),
});

type AskQuestionsToolOutput = {
  answers: AskQuestionAnswer[];
};

const askQuestionAnswerSchema = z.object({
  questionIndex: z.number().int(),
  selectedOptionIndices: z.array(z.number().int()),
  freeText: z.string().optional(),
});

const hasAnswerContent = (answer: AskQuestionAnswer) =>
  isNonEmptyString(answer.freeText?.trim()) ||
  isNonEmptyArray(answer.selectedOptionIndices);

const buildAskQuestionsOutputSchema = ({
  questions,
}: AskQuestionsToolInput): z.ZodType<AskQuestionsToolOutput> =>
  z
    .object({ answers: z.array(askQuestionAnswerSchema) })
    .superRefine(({ answers }, context) => {
      const answeredQuestionIndices = new Set<number>();

      for (const answer of answers) {
        const question = questions[answer.questionIndex];

        if (!isDefined(question)) {
          context.addIssue({
            code: 'custom',
            message: 'Answer references an unknown question.',
          });

          continue;
        }

        if (answeredQuestionIndices.has(answer.questionIndex)) {
          context.addIssue({
            code: 'custom',
            message: 'Each question can be answered only once.',
          });
        }

        answeredQuestionIndices.add(answer.questionIndex);

        if (
          answer.selectedOptionIndices.some(
            (optionIndex) =>
              optionIndex < 0 || optionIndex >= question.options.length,
          )
        ) {
          context.addIssue({
            code: 'custom',
            message: 'Answer references an unknown option.',
          });
        }

        if (
          question.allowMultiSelect !== true &&
          answer.selectedOptionIndices.length > 1
        ) {
          context.addIssue({
            code: 'custom',
            message: 'This question allows only one selection.',
          });
        }
      }

      if (!answers.some(hasAnswerContent)) {
        context.addIssue({
          code: 'custom',
          message: 'Provide at least one answer.',
        });
      }
    });

const buildAnswerText = ({
  answers,
  questions,
}: AskQuestionsToolOutput & AskQuestionsToolInput) =>
  answers
    .flatMap((answer) => {
      const question = questions[answer.questionIndex];

      if (!isDefined(question)) {
        return [];
      }

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

      return isNonEmptyString(value) ? [`${question.question}\n${value}`] : [];
    })
    .join('\n\n');

// the multi-question tool ask_question replaced, kept so calls stored before can still be
// answered and read
export const ASK_QUESTIONS_PAUSING_TOOL = definePausingTool<
  AskQuestionsToolInput,
  AskQuestionsToolOutput
>({
  inputSchema: askQuestionsInputSchema,
  outputSchema: buildAskQuestionsOutputSchema,
  complete: async ({ output: { answers }, input: { questions } }) => ({
    toolResult: {
      success: true,
      message: 'User answered the questions.',
      result: {
        questions,
        status: 'answered',
        answers,
      } satisfies AskQuestionsToolResult,
    },
    answerText: buildAnswerText({ answers, questions }),
  }),
  toSkippedToolResult: ({ questions }) => ({
    success: true,
    message: 'User skipped the questions and sent another message instead.',
    result: { questions, status: 'skipped' } satisfies AskQuestionsToolResult,
  }),
});
