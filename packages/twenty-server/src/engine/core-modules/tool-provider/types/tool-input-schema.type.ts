import { type z } from 'zod';

export type ToolInputSchema =
  | z.ZodObject
  | z.ZodDiscriminatedUnion<readonly z.ZodObject[]>;
