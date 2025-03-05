import { objectMetadataItemSchema } from '@/object-metadata/validation-schemas/objectMetadataItemSchema';
import { isCapitalizedWord, isDefined } from 'twenty-shared';
import { z } from 'zod';

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
            fatal: true,
          }),
        );

        return z.NEVER;
      }

      if (
        !isDefined(isLabelSyncedWithName) ||
        isLabelSyncedWithName === false
      ) {
        if (nameSingular && isCapitalizedWord(nameSingular)) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'nameSingular should follow camel case',
            path: ['nameSingular'],
          });
        }

        if (namePlural && isCapitalizedWord(namePlural)) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'namePlural should follow camel case',
            path: ['namePlural'],
          });
        }
      }
    },
  );
export type SettingsDataModelObjectAboutFormValues = z.infer<
  typeof settingsDataModelObjectAboutFormSchema
>;
