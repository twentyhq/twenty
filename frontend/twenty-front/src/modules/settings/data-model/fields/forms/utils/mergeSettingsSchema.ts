import z from 'zod';

export const mergeSettingsSchemas = (
  ...schemas: z.ZodObject<{ settings: z.ZodObject<any> }>[]
) => {
  return z.object({
    settings: schemas.reduce(
      (acc, schema) => acc.merge(schema.shape.settings),
      z.object({}) as z.ZodObject<any>,
    ),
  });
};
