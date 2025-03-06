import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { isDefined } from 'twenty-shared';
import { ZodType, z } from 'zod';
import { ReadonlyKeysArray } from '~/types/ReadonlyKeysArray';
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
  description: z.string().optional(),
  icon: z.string().optional(),
  labelSingular: zodNonEmptyString,
  labelPlural: zodNonEmptyString,
  namePlural: zodNonEmptyString,
  nameSingular: zodNonEmptyString,
  isLabelSyncedWithName: z.boolean(),
}) satisfies ZodTypeSettingsDataModelFormFields;

export const settingsDataModelObjectAboutFormSchema =
  settingsDataModelFormFieldsSchema.superRefine(
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
      const labelsAreDifferent =
        labelPlural.toLowerCase() !== labelSingular.toLocaleLowerCase();
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

      const nameAreDifferent =
        nameSingular.toLocaleLowerCase() !== namePlural.toLowerCase();
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
