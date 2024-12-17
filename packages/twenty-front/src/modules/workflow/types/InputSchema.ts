import { FieldMetadataType } from '~/generated/graphql';

export type InputSchemaPropertyType =
  | 'string'
  | 'number'
  | 'boolean'
  | 'object'
  | 'array'
  | 'unknown'
  | FieldMetadataType;

export type InputSchemaProperty = {
  type: InputSchemaPropertyType;
  enum?: string[];
  items?: InputSchemaProperty;
  properties?: Properties;
};

type Properties = {
  [name: string]: InputSchemaProperty;
};

export type InputSchema = InputSchemaProperty[];
