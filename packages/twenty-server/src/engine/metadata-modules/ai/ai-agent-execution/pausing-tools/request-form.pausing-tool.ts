import { isString } from '@sniptt/guards';
import {
  type RequestFormToolInput,
  type RequestFormToolResult,
} from 'twenty-shared/ai';
import { isDefined } from 'twenty-shared/utils';
import { workflowFormFieldSchema } from 'twenty-shared/workflow';
import { z } from 'zod';

import { definePausingTool } from 'src/engine/metadata-modules/ai/ai-agent-execution/pausing-tools/utils/define-pausing-tool.util';

const requestFormFieldSchema = workflowFormFieldSchema.pick({
  name: true,
  label: true,
  type: true,
  placeholder: true,
  settings: true,
});

// form steps issue this call with every field, so recorded calls skip the agent's limits
const requestFormCallSchema = z.object({
  fields: z.array(requestFormFieldSchema),
});

export const requestFormInputSchema = z.object({
  fields: z
    .array(requestFormFieldSchema)
    .min(1)
    .max(10)
    .refine(
      (fields) =>
        new Set(fields.map((field) => field.name)).size === fields.length,
      { message: 'Each field needs its own name.' },
    )
    .describe(
      'The fields to fill in, in order. Each name is unique and keys its value in the result. ' +
        'A RECORD field needs settings.objectName, the singular name of the object to pick from (e.g. "company"). ' +
        'A SELECT or MULTI_SELECT field needs settings.selectedFieldId, the id of an existing select field whose options it offers.',
    ),
});

// A workflow form step writes the same output when it issues this call.
export const buildRequestFormPendingOutput = (): {
  success: true;
  message: string;
  result: RequestFormToolResult;
} => ({
  success: true,
  message: 'Form presented to the user; awaiting their answer.',
  result: { status: 'pending' },
});

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
  inputSchema: requestFormCallSchema,
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
