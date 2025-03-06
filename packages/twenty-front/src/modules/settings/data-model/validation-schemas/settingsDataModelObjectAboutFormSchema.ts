import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { isDefined } from 'twenty-shared';
import { ZodType, z } from 'zod';
import { ReadonlyKeysArray } from '~/types/ReadonlyKeysArray';
import { zodNonEmptyString } from '~/types/ZodNonEmptyString';
import { camelCaseStringSchema } from '~/utils/validation-schemas/camelCaseStringSchema';

const requiredFormFields = z.object({
  description: z.string(),
  icon: z.string(),
  labelSingular: zodNonEmptyString,
  labelPlural: zodNonEmptyString,
}) satisfies ZodType<
  Pick<
    ObjectMetadataItem,
    'labelSingular' | 'labelPlural' | 'description' | 'icon'
  >
>;

const optionalFormFields = z.object({
  namePlural: zodNonEmptyString.optional(),
  nameSingular: zodNonEmptyString.optional(),
  isLabelSyncedWithName: z.boolean().optional(),
}) satisfies ZodType<
  Partial<
    Pick<
      ObjectMetadataItem,
      'namePlural' | 'nameSingular' | 'isLabelSyncedWithName'
    >
  >
>;

export const settingsDataModelObjectAboutFormSchema = requiredFormFields
  .merge(optionalFormFields)
  .superRefine(
    (
      {
        labelPlural,
        labelSingular,
        isLabelSyncedWithName,
        namePlural,
        nameSingular,
      },
      ctx,
    ) => {
      const labelsAreDifferent = labelPlural !== labelSingular;
      if (!labelsAreDifferent) {
        const labelFields: ReadonlyKeysArray<ObjectMetadataItem> = [
          'labelPlural',
          'labelSingular',
        ];
        labelFields.forEach((field) =>
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'Invalid label',
            path: [field],
          }),
        );
      }

      const nameAreDifferent = nameSingular !== namePlural;
      if (!nameAreDifferent) {
        const nameFields: ReadonlyKeysArray<ObjectMetadataItem> = [
          'nameSingular',
          'namePlural',
        ];
        nameFields.forEach((field) =>
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'Invalid name',
            path: [field],
          }),
        );
      }

      if (
        !isDefined(isLabelSyncedWithName) ||
        isLabelSyncedWithName === false
      ) {
        if (
          nameSingular &&
          !camelCaseStringSchema.safeParse(nameSingular).success
        ) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'Should follow camel case',
            path: [
              'nameSingular',
            ] satisfies ReadonlyKeysArray<ObjectMetadataItem>,
          });
        }

        if (
          namePlural &&
          !camelCaseStringSchema.safeParse(namePlural).success
        ) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'Should follow camel case',
            path: [
              'namePlural',
            ] satisfies ReadonlyKeysArray<ObjectMetadataItem>,
          });
        }
      }
    },
  );
export type SettingsDataModelObjectAboutFormValues = z.infer<
  typeof settingsDataModelObjectAboutFormSchema
>;
