import { type FieldFilesValue } from '@/object-record/record-field/ui/types/FieldMetadata';
import { z } from 'zod';

const fileSchema = z.object({
  fileId: z.string(),
  label: z.string(),
  fileType: z.string(),
});

export const filesSchema = z.union([z.null(), z.array(fileSchema)]);

export const isFieldFilesValue = (
  fieldValue: unknown,
): fieldValue is FieldFilesValue => filesSchema.safeParse(fieldValue).success;
