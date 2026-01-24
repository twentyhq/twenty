import { type FieldFilesValue } from '@/object-record/record-field/ui/types/FieldMetadata';
import { FILE_CATEGORIES } from 'twenty-shared/types';
import { z } from 'zod';

const fileCategoryValues = Object.values(FILE_CATEGORIES) as [
  string,
  ...string[],
];

const fileSchema = z.object({
  fileId: z.string(),
  label: z.string(),
  fileCategory: z.enum(fileCategoryValues),
});

export const filesSchema = z.union([z.null(), z.array(fileSchema)]);

export const isFieldFilesValue = (
  fieldValue: unknown,
): fieldValue is FieldFilesValue => filesSchema.safeParse(fieldValue).success;
