import { type ConditionalDisplay } from 'twenty-shared/types';

// Legacy types - kept for temporary configuration fallback
export type FieldsConfigurationFieldItem = {
  fieldMetadataId: string;
  position: number;
  conditionalDisplay?: ConditionalDisplay | null;
  // TODO: This property will be removed. Instead, we will only store the fields we want to display in FieldsConfiguration
  isVisible?: boolean;
};

export type FieldsConfigurationGroup = {
  id: string;
  title: string;
  position: number;
  fields: FieldsConfigurationFieldItem[];
};
