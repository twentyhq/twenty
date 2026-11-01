import { type z } from 'zod';

import {
  AiException,
  AiExceptionCode,
} from 'src/engine/metadata-modules/ai/ai.exception';

// the resolvers check only the GraphQL shape, so the JSON fields are parsed here before they reach the model
export const parseAgentInputOrThrow = <TSchema extends z.ZodType>({
  schema,
  input,
  label = 'input',
}: {
  schema: TSchema;
  input: unknown;
  // names the field the schema parses, since issue paths are relative to it
  label?: string;
}): z.infer<TSchema> => {
  const parsedInput = schema.safeParse(input);

  if (!parsedInput.success) {
    throw new AiException(
      `Invalid ${label}: ${parsedInput.error.issues
        .map(({ path, message }) =>
          path.length > 0 ? `${path.join('.')}: ${message}` : message,
        )
        .join(', ')}`,
      AiExceptionCode.INVALID_AGENT_INPUT,
    );
  }

  return parsedInput.data;
};
