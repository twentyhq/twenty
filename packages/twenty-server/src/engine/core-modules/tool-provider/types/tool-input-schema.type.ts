import { type z } from 'zod';

// A discriminated union lets one tool take several object variants, e.g. one per item type
export type ToolInputSchema =
  | z.ZodObject
  | z.ZodDiscriminatedUnion<readonly z.ZodObject[]>;
