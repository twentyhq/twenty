import { z } from 'zod';

const DEFAULT_LOADING_MESSAGE_SCHEMA = z
  .string()
  .describe(
    "A brief present-tense status message shown to the user while the tool runs (e.g., 'Sending email to customer').",
  );

const DEFAULT_COMPLETED_MESSAGE_SCHEMA = z
  .string()
  .describe(
    "A brief past-tense status message shown to the user after the tool finishes (e.g., 'Sent email to customer').",
  );

// Wraps a flat Zod tool schema with loading/completed messages for AI execution
export const wrapSchemaForExecution = <T extends z.ZodRawShape>(
  schema: z.ZodObject<T>,
  customLoadingMessageSchema?: z.ZodString,
): z.ZodObject<
  T & { loadingMessage: z.ZodString; completedMessage: z.ZodString }
> => {
  return z.object({
    loadingMessage:
      customLoadingMessageSchema ?? DEFAULT_LOADING_MESSAGE_SCHEMA,
    completedMessage: DEFAULT_COMPLETED_MESSAGE_SCHEMA,
    ...schema.shape,
  }) as z.ZodObject<
    T & { loadingMessage: z.ZodString; completedMessage: z.ZodString }
  >;
};

// For non-Zod schemas (logic functions with JSON Schema)
export const wrapJsonSchemaForExecution = (
  schema: Record<string, unknown>,
): Record<string, unknown> => {
  const properties = (schema.properties as Record<string, unknown>) ?? {};
  const required = (schema.required as string[]) ?? [];

  return {
    type: 'object',
    properties: {
      loadingMessage: {
        type: 'string',
        description:
          "A brief present-tense status message shown to the user while the tool runs (e.g., 'Sending email to customer').",
      },
      completedMessage: {
        type: 'string',
        description:
          "A brief past-tense status message shown to the user after the tool finishes (e.g., 'Sent email to customer').",
      },
      ...properties,
    },
    required: ['loadingMessage', 'completedMessage', ...required],
  };
};

// Strips status messages from parameters before passing to tool execute
export const stripLoadingMessage = <T extends Record<string, unknown>>(
  parameters: T,
): Omit<T, 'loadingMessage' | 'completedMessage'> => {
  const {
    loadingMessage: _loadingMessage,
    completedMessage: _completedMessage,
    ...rest
  } = parameters;

  return rest;
};
