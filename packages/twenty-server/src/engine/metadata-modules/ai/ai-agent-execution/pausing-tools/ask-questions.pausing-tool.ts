import { isNonEmptyString } from '@sniptt/guards';
import {
  type AskQuestionAnswer,
  type AskQuestionsToolInput,
  type AskQuestionsToolResult,
} from 'twenty-shared/ai';
import {
  isDefined,
  isNonEmptyArray,
  isPlainObject,
} from 'twenty-shared/utils';
import { z } from 'zod';

import { definePausingTool } from 'src/engine/metadata-modules/ai/ai-agent-execution/pausing-tools/utils/define-pausing-tool.util';
import { askQuestionsInputSchema } from 'src/engine/metadata-modules/ai/ai-chat/tools/ask-questions.tool';

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

// The result keeps the shape the tool part had before answers were resolved
// through Asks, which the chat renderer, the admin panel and the seeded runs
// all read.
export const ASK_QUESTIONS_PAUSING_TOOL = definePausingTool<
  AskQuestionsToolInput,
  AskQuestionsToolOutput
>({
  inputSchema: askQuestionsInputSchema,
  outputSchema: buildAskQuestionsOutputSchema,
  isAwaitingOutput: (toolOutput) =>
    isPlainObject(toolOutput) &&
    isPlainObject(toolOutput.result) &&
    toolOutput.result.status === 'pending',
  buildAsk: ({ questions }) => ({
    name: questions[0]?.question ?? null,
    form: { kind: 'questions', questions },
  }),
  toToolResult: ({ answers }, { questions }) => ({
    success: true,
    message: 'User answered the questions.',
    result: {
      questions,
      status: 'answered',
      answers,
    } satisfies AskQuestionsToolResult,
  }),
  toSkippedToolResult: ({ questions }) => ({
    success: true,
    message: 'User skipped the questions and sent another message instead.',
    result: { questions, status: 'skipped' } satisfies AskQuestionsToolResult,
  }),
  toAnswerText: ({ answers }, { questions }) =>
    answers
      .flatMap((answer) => {
        const question = questions[answer.questionIndex];
        const freeText = answer.freeText?.trim();
        const value = isNonEmptyString(freeText)
          ? freeText
          : answer.selectedOptionIndices
              .map((optionIndex) => question.options[optionIndex].label)
              .join(', ');

        return isNonEmptyString(value) ? [`${question.question}\n${value}`] : [];
      })
      .join('\n\n'),
});
