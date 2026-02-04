import { type RulesLogic } from 'json-logic-js';

export type FieldsConfigurationFieldItem = {
  fieldMetadataId: string;
  position: number;
  conditionalDisplay?: RulesLogic;
  // TODO: This property will be removed. Instead, we will only store the fields we want to display in FieldsConfiguration
  isVisible?: boolean;
};

export type FieldsConfigurationSection = {
  id: string;
  title: string;
  position: number;
  fields: FieldsConfigurationFieldItem[];
};

export type FieldsConfiguration = {
  __typename: 'FieldsConfiguration';
  configurationType: 'FIELDS';
  sections: FieldsConfigurationSection[];
};
