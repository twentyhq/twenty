import { type RulesLogic } from 'json-logic-js';
import { type WidgetConfigurationType } from '~/generated/graphql';

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
  __typename: 'FieldsConfiguration';
  configurationType: WidgetConfigurationType.FIELDS;
  sections: FieldsConfigurationSection[];
};
