import { type FieldMetadataType } from 'twenty-shared/types';

export type RecordFieldLeaf = {
  isLeaf: true;
  type: FieldMetadataType;
  label: string;
  value: any;
  fieldMetadataId: string;
  isCompositeSubField: boolean;
};

export type RecordFieldNode = {
  isLeaf: false;
  type: FieldMetadataType;
  label: string;
  value: RecordFieldNodeValue;
  fieldMetadataId: string;
};

export type RecordFieldNodeValue =
  | RecordOutputSchemaV2
  | Record<string, RecordFieldLeaf>;

export type FieldOutputSchemaV2 = RecordFieldLeaf | RecordFieldNode;

export type RecordOutputSchemaV2 = {
  object: {
    label: string;
    objectMetadataId: string;
    isRelationField?: boolean;
  };
  fields: Record<string, FieldOutputSchemaV2>;
  _outputSchemaType: 'RECORD';
};
