import { z } from 'zod';

export function deepMergeZod(schema1: any, schema2: any) {
  // For non-object schemas, return schema2 (overwrites)
  if (!(schema1 instanceof z.ZodObject) || !(schema2 instanceof z.ZodObject)) {
    return schema2;
  }

  const shape1 = schema1.shape;
  const shape2 = schema2.shape;
  const mergedShape = { ...shape1 };

  for (const key in shape2) {
    if (key in shape1) {
      // Recursively merge if both are objects
      mergedShape[key] = deepMergeZod(shape1[key], shape2[key]);
    } else {
      mergedShape[key] = shape2[key];
    }
  }

  return z.object(mergedShape);
}
