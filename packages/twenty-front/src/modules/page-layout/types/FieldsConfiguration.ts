import { type RulesLogic } from 'json-logic-js';

export type FieldsConfigurationFieldItem = {
  fieldMetadataId: string;
  position: number;
  conditionalDisplay?: RulesLogic;
};

export type FieldsConfigurationSection = {
  id: string;
  title: string;
  position: number;
  fields: FieldsConfigurationFieldItem[];
};

export type FieldsConfiguration = {
  sections: FieldsConfigurationSection[];
};
