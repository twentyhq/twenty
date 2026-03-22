import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { t } from '@lingui/core/macro';
import { type ZodType, z } from 'zod';
import { type ReadonlyKeysArray } from '~/types/ReadonlyKeysArray';
import { zodNonEmptyString } from '~/types/ZodNonEmptyString';
import { camelCaseStringSchema } from '~/utils/validation-schemas/camelCaseStringSchema';

type ZodTypeSettingsDataModelFormFields = ZodType<
  Pick<
    EnrichedObjectMetadataItem,
    | 'labelSingular'
    | 'labelPlural'
    | 'description'
    | 'icon'
    | 'namePlural'
    | 'nameSingular'
    | 'isLabelSyncedWithName'
  > & { skipNameField?: boolean }
>;
const settingsDataModelFormFieldsSchema = z.object({
  description: z.string().nullish(),
  icon: z.string().optional(),
  labelSingular: zodNonEmptyString,
  labelPlural: zodNonEmptyString,
  namePlural: zodNonEmptyString.and(camelCaseStringSchema),
  nameSingular: zodNonEmptyString.and(camelCaseStringSchema),
  isLabelSyncedWithName: z.boolean(),
  skipNameField: z.boolean().optional(),
}) satisfies ZodTypeSettingsDataModelFormFields;

export const settingsDataModelObjectAboutFormSchema =
  settingsDataModelFormFieldsSchema.superRefine(
    ({ namePlural, nameSingular }, ctx) => {
      const nameAreDifferent =
        nameSingular.toLowerCase() !== namePlural.toLowerCase();
      if (!nameAreDifferent) {
        const nameFields: ReadonlyKeysArray<EnrichedObjectMetadataItem> = [
          'nameSingular',
          'namePlural',
        ];
        nameFields.forEach((field) =>
          ctx.addIssue({
            code: 'custom',
            message: t`Singular and plural names must be different`,
            path: [field],
          }),
        );
      }
    },
  );
export type SettingsDataModelObjectAboutFormValues = z.infer<
  typeof settingsDataModelObjectAboutFormSchema
>;
