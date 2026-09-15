import { z } from 'zod';
import { IndexType } from '~/generated-metadata/graphql';

export const settingsObjectNewIndexFormSchema = z.object({
  fields: z
    .array(
      z.object({
        fieldMetadataId: z.string().uuid(),
        subFieldName: z.string().nullable(),
      }),
    )
    .min(1),
  indexType: z.nativeEnum(IndexType),
});

export type SettingsObjectNewIndexFormValues = z.infer<
  typeof settingsObjectNewIndexFormSchema
>;
