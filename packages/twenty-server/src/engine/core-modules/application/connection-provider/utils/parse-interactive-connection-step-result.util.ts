import { type InteractiveConnectionStepResult } from 'twenty-shared/application';
import { z } from 'zod';

import { INTERACTIVE_CONNECTION_LIMITS } from 'src/engine/core-modules/application/connection-provider/constants/interactive-connection-limits.constant';
import { formatLogicFunctionResultIssues } from 'src/engine/core-modules/logic-function/logic-function-executor/utils/format-logic-function-result-issues.util';
import { EXTERNAL_ACCOUNT_ID_MAX_LENGTH } from 'src/engine/metadata-modules/connected-account/constants/external-account-id-max-length.constant';

const textSchema = z
  .string()
  .trim()
  .min(1)
  .max(INTERACTIVE_CONNECTION_LIMITS.maxTextLength);

const pollIntervalSecondsSchema = z
  .number()
  .finite()
  .transform((pollIntervalSeconds) =>
    Math.min(
      Math.max(
        pollIntervalSeconds,
        INTERACTIVE_CONNECTION_LIMITS.minPollIntervalSeconds,
      ),
      INTERACTIVE_CONNECTION_LIMITS.maxPollIntervalSeconds,
    ),
  );

const fieldSchema = z
  .object({
    key: z.string().regex(/^[a-zA-Z][a-zA-Z0-9_-]{0,63}$/),
    label: textSchema,
    kind: z.enum(['text', 'email', 'password', 'code']),
    placeholder: textSchema.optional(),
    defaultValue: z
      .string()
      .max(INTERACTIVE_CONNECTION_LIMITS.maxValueLength)
      .optional(),
  })
  .refine(
    (field) => field.kind !== 'password' || field.defaultValue === undefined,
    {
      message: 'a password field cannot have a defaultValue',
    },
  );

const screenSchema = z.discriminatedUnion('type', [
  z.object({
    type: z.literal('form'),
    title: textSchema,
    description: textSchema.optional(),
    fields: z
      .array(fieldSchema)
      .min(1)
      .max(INTERACTIVE_CONNECTION_LIMITS.maxFieldCount)
      .refine(
        (fields) =>
          new Set(fields.map((field) => field.key)).size === fields.length,
        { message: 'field keys must be unique' },
      ),
    submitLabel: textSchema.optional(),
    error: textSchema.optional(),
  }),
  z.object({
    type: z.literal('waiting'),
    title: textSchema,
    description: textSchema.optional(),
    pollIntervalSeconds: pollIntervalSecondsSchema,
  }),
  z.object({
    type: z.literal('qr-code'),
    title: textSchema,
    description: textSchema.optional(),
    data: z
      .string()
      .min(1)
      .max(INTERACTIVE_CONNECTION_LIMITS.maxQrCodeDataLength),
    pollIntervalSeconds: pollIntervalSecondsSchema,
  }),
]);

const stateSchema = z
  .record(z.string(), z.unknown())
  .refine(
    (state) =>
      Buffer.byteLength(JSON.stringify(state)) <=
      INTERACTIVE_CONNECTION_LIMITS.maxStateBytes,
    { message: 'state is too large' },
  );

const stepResultSchema = z.discriminatedUnion('type', [
  z.object({
    type: z.literal('screen'),
    screen: screenSchema,
    state: stateSchema,
  }),
  z.object({
    type: z.literal('done'),
    externalAccountId: z
      .string()
      .trim()
      .min(1)
      .max(EXTERNAL_ACCOUNT_ID_MAX_LENGTH),
    handle: z.string().trim().min(1).optional(),
    accessToken: z.string().min(1).optional(),
  }),
  z.object({ type: z.literal('cancelled') }),
]);

type ParseInteractiveConnectionStepResultOutcome =
  | { isValid: true; stepResult: InteractiveConnectionStepResult }
  | { isValid: false; reason: string };

export const parseInteractiveConnectionStepResult = (
  data: unknown,
): ParseInteractiveConnectionStepResultOutcome => {
  const parsed = stepResultSchema.safeParse(data);

  if (!parsed.success) {
    return {
      isValid: false,
      reason: formatLogicFunctionResultIssues(parsed.error),
    };
  }

  return { isValid: true, stepResult: parsed.data };
};
