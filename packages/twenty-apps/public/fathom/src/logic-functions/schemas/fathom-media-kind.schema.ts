import { z } from 'zod';

export const fathomMediaKindSchema = z.enum(['video', 'audio']);

export type FathomMediaKind = z.infer<typeof fathomMediaKindSchema>;
