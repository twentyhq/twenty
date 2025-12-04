import { z } from 'zod';

export const deepMergeZod = <
  T extends z.ZodObject<any>,
  U extends z.ZodObject<any>,
>(
  schema1: T,
  schema2: U,
): z.ZodObject<any> => {
  const shape1 = schema1.shape;
  const shape2 = schema2.shape;
  const mergedShape: any = { ...shape1 };

  for (const key in shape2) {
    if (
      key in shape1 &&
      shape1[key] instanceof z.ZodObject &&
      shape2[key] instanceof z.ZodObject
    ) {
      // Recursively merge if both are objects
      mergedShape[key] = deepMergeZod(
        shape1[key] as z.ZodObject<any>,
        shape2[key] as z.ZodObject<any>,
      );
    } else {
      mergedShape[key] = shape2[key];
    }
  }

  return z.object(mergedShape);
};
