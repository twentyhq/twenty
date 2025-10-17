import { type LeafType, type NodeType } from 'twenty-shared/workflow';
import { type FieldMetadataType } from '~/generated-metadata/graphql';

export type InputSchemaPropertyType = LeafType | NodeType | FieldMetadataType;

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
