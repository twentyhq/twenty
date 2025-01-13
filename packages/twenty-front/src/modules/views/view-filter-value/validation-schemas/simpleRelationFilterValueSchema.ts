import { z } from 'zod';

export const simpleRelationFilterValueSchema = z
  .preprocess(
    (value) => (typeof value === 'string' ? value.split(',') : []),
    z.array(z.string().uuid()),
  )
  .catch([]);
