import { type urlRecursiveFilterGroupSchema } from '@/views/schemas/urlRecursiveFilterGroupSchema';
import { type z } from 'zod';

export type UrlRecursiveFilterGroup = z.infer<
  typeof urlRecursiveFilterGroupSchema
>;
