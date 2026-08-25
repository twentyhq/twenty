import { z } from 'zod';

export const PrepareUploadedFileInputZodSchema = z.object({
  fileId: z
    .string()
    .describe(
      'The fileId of a file the user uploaded in this conversation, as listed in the Uploaded Files section',
    ),
  label: z
    .string()
    .describe('The file name to display on the record, e.g. "contract.pdf"'),
  objectNameSingular: z
    .string()
    .describe(
      'The singular name of the object holding the files field, e.g. "attachment"',
    ),
  fieldName: z
    .string()
    .describe('The name of the files field on that object, e.g. "file"'),
});

export type PrepareUploadedFileInput = z.infer<
  typeof PrepareUploadedFileInputZodSchema
>;
