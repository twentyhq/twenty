import { z } from 'zod';

export const simpleRelationFilterValueSchema = z
  .preprocess((value) => {
    try {
      return typeof value === 'string' ? JSON.parse(value) : [];
    } catch {
      return [];
    }
  }, z.array(z.string().uuid()))
  .catch([]);
