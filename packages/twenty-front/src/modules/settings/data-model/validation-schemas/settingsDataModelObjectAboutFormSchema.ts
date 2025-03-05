import { objectMetadataItemSchema } from '@/object-metadata/validation-schemas/objectMetadataItemSchema';
import { isDefined } from 'twenty-shared';
import { z } from 'zod';
import { camelCaseStringSchema } from '~/utils/validation-schemas/camelCaseStringSchema';

const requiredFormFields = objectMetadataItemSchema.pick({
  description: true, // what happens if empty string ?
  icon: true,
});

// Can ApiNames contains whitespace ?
const zodNonEmptyString = z.string().min(1);
const optionalFormFields = z.object({
  labelSingular: zodNonEmptyString,
  labelPlural: zodNonEmptyString,
  namePlural: zodNonEmptyString.optional(),
  nameSingular: zodNonEmptyString.optional(),
  isLabelSyncedWithName: z.boolean().optional(),
});
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
        ['labelPlural', 'labelSingular'].forEach((field) =>
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'Invalid label',
            path: [field],
          }),
        );
      }

      const nameAreDifferent = nameSingular !== namePlural;
      if (!nameAreDifferent) {
        ['nameSingular', 'namePlural'].forEach((field) =>
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
            path: ['nameSingular'],
          });
        }

        if (
          namePlural &&
          !camelCaseStringSchema.safeParse(namePlural).success
        ) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'Should follow camel case',
            path: ['namePlural'],
          });
        }
      }
    },
  );
export type SettingsDataModelObjectAboutFormValues = z.infer<
  typeof settingsDataModelObjectAboutFormSchema
>;
