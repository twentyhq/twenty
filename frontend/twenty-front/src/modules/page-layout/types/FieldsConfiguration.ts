import { type RulesLogic } from 'json-logic-js';

// Legacy types - kept for temporary configuration fallback
export type FieldsConfigurationFieldItem = {
  fieldMetadataId: string;
  position: number;
  conditionalDisplay?: RulesLogic;
  // TODO: This property will be removed. Instead, we will only store the fields we want to display in FieldsConfiguration
  isVisible?: boolean;
};

export type FieldsConfigurationGroup = {
  id: string;
  title: string;
  position: number;
  fields: FieldsConfigurationFieldItem[];
};
