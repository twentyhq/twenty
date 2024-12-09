import { z } from 'zod';

export const safeStringArrayJSONSchema = z
  .preprocess((value) => {
    try {
      if (typeof value !== 'string') {
        return [];
      }
      return JSON.parse(value);
    } catch {
      return [];
    }
  }, z.array(z.string()))
  .catch([]);
