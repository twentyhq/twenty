import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { t } from '@lingui/core/macro';
import { type ZodType, z } from 'zod';
import { type ReadonlyKeysArray } from '~/types/ReadonlyKeysArray';
import { zodNonEmptyString } from '~/types/ZodNonEmptyString';
import { camelCaseStringSchema } from '~/utils/validation-schemas/camelCaseStringSchema';

type ZodTypeSettingsDataModelFormFields = ZodType<
  Pick<
    ObjectMetadataItem,
    | 'labelSingular'
    | 'labelPlural'
    | 'description'
    | 'icon'
    | 'namePlural'
    | 'nameSingular'
    | 'isLabelSyncedWithName'
  >
>;
const settingsDataModelFormFieldsSchema = z.object({
  description: z.string().nullish(),
  icon: z.string().optional(),
  labelSingular: zodNonEmptyString,
  labelPlural: zodNonEmptyString,
  namePlural: zodNonEmptyString.and(camelCaseStringSchema),
  nameSingular: zodNonEmptyString.and(camelCaseStringSchema),
  isLabelSyncedWithName: z.boolean(),
}) satisfies ZodTypeSettingsDataModelFormFields;

export const settingsDataModelObjectAboutFormSchema =
  settingsDataModelFormFieldsSchema.superRefine(
    ({ labelPlural, labelSingular, namePlural, nameSingular }, ctx) => {
      const labelsAreDifferent =
        labelPlural.trim().toLowerCase() !== labelSingular.trim().toLowerCase();
      if (!labelsAreDifferent) {
        const labelFields: ReadonlyKeysArray<ObjectMetadataItem> = [
          'labelPlural',
          'labelSingular',
        ];
        labelFields.forEach((field) =>
          ctx.addIssue({
            code: 'custom',
            message: t`Singular and plural labels must be different`,
            path: [field],
          }),
        );
      }

      const nameAreDifferent =
        nameSingular.toLowerCase() !== namePlural.toLowerCase();
      if (!nameAreDifferent) {
        const nameFields: ReadonlyKeysArray<ObjectMetadataItem> = [
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
