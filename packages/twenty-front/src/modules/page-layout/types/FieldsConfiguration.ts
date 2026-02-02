import { type RulesLogic } from 'json-logic-js';

export type FieldsConfigurationFieldItem = {
  fieldMetadataId: string;
  position: number;
  conditionalDisplay?: RulesLogic;
  // TODO: This will be replaced by a proper conditionalDisplay condition in the future
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
