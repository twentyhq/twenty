import { isString } from '@sniptt/guards';
import {
  type RequestFormToolInput,
  type RequestFormToolResult,
} from 'twenty-shared/ai';
import { isDefined } from 'twenty-shared/utils';
import { z } from 'zod';

import { definePausingTool } from 'src/engine/metadata-modules/ai/ai-agent-execution/pausing-tools/utils/define-pausing-tool.util';
import { requestFormInputSchema } from 'src/engine/metadata-modules/ai/ai-chat/tools/request-form.tool';

type RequestFormToolOutput = Record<string, unknown>;

const buildRequestFormOutputSchema = ({
  fields,
}: RequestFormToolInput): z.ZodType<RequestFormToolOutput> => {
  const fieldNames = new Set(fields.map((field) => field.name));

  return z.record(z.string(), z.unknown()).superRefine((values, context) => {
    for (const fieldName of Object.keys(values)) {
      if (!fieldNames.has(fieldName)) {
        context.addIssue({
          code: 'custom',
          message: `The form has no field named ${fieldName}.`,
        });
      }
    }
  });
};

const buildAnswerText = ({
  fields,
  values,
}: RequestFormToolInput & { values: RequestFormToolOutput }) =>
  fields
    .filter((field) => isDefined(values[field.name]))
    .map((field) => {
      const value = values[field.name];

      return `${field.label}: ${isString(value) ? value : JSON.stringify(value)}`;
    })
    .join('\n') || 'Submitted the form.';

export const REQUEST_FORM_PAUSING_TOOL = definePausingTool<
  RequestFormToolInput,
  RequestFormToolOutput
>({
  inputSchema: requestFormInputSchema,
  outputSchema: buildRequestFormOutputSchema,
  complete: async ({ output, input: { fields } }) => ({
    toolResult: {
      success: true,
      message: 'User submitted the form.',
      result: {
        status: 'answered',
        values: output,
      } satisfies RequestFormToolResult,
    },
    answerText: buildAnswerText({ fields, values: output }),
  }),
  toSkippedToolResult: () => ({
    success: true,
    message: 'User skipped the form and sent another message instead.',
    result: { status: 'skipped' } satisfies RequestFormToolResult,
  }),
});
