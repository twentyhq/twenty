import { MULTI_ITEM_FIELD_MIN_MAX_VALUES } from 'twenty-shared/constants';
import { z } from 'zod';

export const settingsDataModelFieldMaxValuesSchema = z.object({
  settings: z.object({
    maxNumberOfValues: z.number().int().min(MULTI_ITEM_FIELD_MIN_MAX_VALUES),
  }),
});

export type SettingsDataModelFieldMaxValuesFormValues = z.infer<
  typeof settingsDataModelFieldMaxValuesSchema
>;
