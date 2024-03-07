import { z } from 'zod';

import { FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';

// TODO: implement fieldMetadataItemSchema
export const fieldMetadataItemSchema: z.ZodType<FieldMetadataItem> = z.any();
