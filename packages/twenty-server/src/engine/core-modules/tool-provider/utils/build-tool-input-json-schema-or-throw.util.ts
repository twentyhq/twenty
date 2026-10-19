import { type z } from 'zod';

import { toToolJsonSchema } from 'src/engine/core-modules/record-crud/utils/to-tool-json-schema.util';

export const buildToolInputJsonSchemaOrThrow = ({
  toolName,
  inputSchema,
}: {
  toolName: string;
  inputSchema: z.ZodObject;
}): object => {
  try {
    return toToolJsonSchema(inputSchema);
  } catch (error) {
    throw new Error(
      `@DefineTool "${toolName}" has an inputSchema that cannot be converted to JSON schema: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
};
