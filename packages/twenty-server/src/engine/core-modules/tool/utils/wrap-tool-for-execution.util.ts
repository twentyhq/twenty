import { z } from 'zod';

const DEFAULT_LOADING_MESSAGE_SCHEMA = z
  .string()
  .describe(
    "A brief status message for the user describing what you're doing (e.g., 'Sending email to customer').",
  );

// Wraps a flat Zod tool schema with loadingMessage for AI execution
export const wrapSchemaForExecution = <T extends z.ZodRawShape>(
  schema: z.ZodObject<T>,
  customLoadingMessageSchema?: z.ZodString,
): z.ZodObject<T & { loadingMessage: z.ZodString }> => {
  return z.object({
    loadingMessage:
      customLoadingMessageSchema ?? DEFAULT_LOADING_MESSAGE_SCHEMA,
    ...schema.shape,
  }) as z.ZodObject<T & { loadingMessage: z.ZodString }>;
};

// For non-Zod schemas (serverless functions with JSON Schema)
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
        description: 'A brief status message for the user.',
      },
      ...properties,
    },
    required: ['loadingMessage', ...required],
  };
};

// Strips loadingMessage from parameters before passing to tool execute
export const stripLoadingMessage = <T extends Record<string, unknown>>(
  parameters: T,
): Omit<T, 'loadingMessage'> => {
  const { loadingMessage: _, ...rest } = parameters;

  return rest;
};
