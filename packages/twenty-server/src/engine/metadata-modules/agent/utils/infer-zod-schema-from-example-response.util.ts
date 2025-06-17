import { z, ZodTypeAny } from 'zod';

export const inferZodSchemaFromExampleResponse = (
  example: Record<string, unknown>,
): ZodTypeAny => {
  if (typeof example === 'string') {
    return z.string();
  }

  if (typeof example === 'number') {
    return z.number();
  }

  if (typeof example === 'boolean') {
    return z.boolean();
  }

  if (example === null) {
    return z.null();
  }

  if (Array.isArray(example)) {
    if (example.length === 0) {
      return z.array(z.any());
    }

    return z.array(inferZodSchemaFromExampleResponse(example[0]));
  }

  if (typeof example === 'object' && example !== null) {
    const shape: Record<string, ZodTypeAny> = {};

    for (const key in example as Record<string, unknown>) {
      shape[key] = inferZodSchemaFromExampleResponse(
        example[key] as Record<string, unknown>,
      );
    }

    return z.object(shape);
  }

  return z.any();
};
