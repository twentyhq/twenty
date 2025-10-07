import { MIN_MAX_NUMBER_OF_VALUES } from 'twenty-shared/constants';
import { z } from 'zod';

export const settingsDataModelFieldMaxValuesSchema = z.object({
  settings: z.object({
    maxNumberOfValues: z.number().int().min(MIN_MAX_NUMBER_OF_VALUES),
  }),
});

export type SettingsDataModelFieldMaxValuesFormValues = z.infer<
  typeof settingsDataModelFieldMaxValuesSchema
>;
