import { type FieldMetadataType } from 'twenty-shared/types';

type BaseLeaf = {
  isLeaf: true;
  type: 'string' | 'number' | 'boolean' | 'unknown' | 'array';
  label?: string;
  icon?: string;
};

type BaseNode = {
  isLeaf: false;
  type: 'object';
  value: BaseOutputSchema;
  label?: string;
  icon?: string;
};

export type BaseOutputSchema = Record<string, BaseLeaf | BaseNode>;

export type FieldLeaf = {
  isLeaf: true;
  fieldMetadataId: string;
  isCompositeSubField: boolean;
  type: FieldMetadataType;
  label?: string;
  icon?: string;
};

export type FieldNode = {
  isLeaf: false;
  fieldMetadataId: string;
  type: FieldMetadataType;
  value: RecordOutputSchema;
  label?: string;
  icon?: string;
};

export type RecordOutputSchema = {
  object: {
    objectMetadataId: string;
    isRelationField?: boolean;
    nameSingular?: string;
    icon?: string;
  };
  fields: Record<string, FieldLeaf | FieldNode>;
  _outputSchemaType: 'RECORD';
};

type Link = {
  isLeaf: true;
  tab?: string;
  icon?: string;
  label?: string;
};

export type CodeOutputSchema = {
  link: Link;
};

export type CreateRecordOutputSchema = RecordOutputSchema;

export type UpdateRecordOutputSchema = RecordOutputSchema;

export type DeleteRecordOutputSchema = RecordOutputSchema;

export type FindRecordsOutputSchema = {
  first: RecordOutputSchema;
  last: RecordOutputSchema;
  count: number;
};

export type SendEmailOutputSchema = {
  success: boolean;
};

export type FormFieldLeaf = {
  isLeaf: true;
  type: FieldMetadataType;
};

export type FormFieldNode = RecordOutputSchema;

export type HttpOutputSchema = {};

export type AiAgentOutputSchema = {};

export type FilterOutputSchema = {};

export type FormOutputSchema = Record<string, FormFieldLeaf | FormFieldNode>;

export type StepOutputSchema = {
  id: string;
  name: string;
  icon?: string;
  outputSchema:
    | CreateRecordOutputSchema
    | UpdateRecordOutputSchema
    | DeleteRecordOutputSchema
    | FindRecordsOutputSchema
    | SendEmailOutputSchema
    | FormOutputSchema
    | CodeOutputSchema
    | HttpOutputSchema
    | AiAgentOutputSchema
    | FilterOutputSchema;
};
