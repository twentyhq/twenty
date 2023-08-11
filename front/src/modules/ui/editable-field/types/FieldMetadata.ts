import { EntityForSelect } from '@/ui/input/relation-picker/types/EntityForSelect';
import { Entity } from '@/ui/input/relation-picker/types/EntityTypeForSelect';

export type FieldType =
  | 'text'
  | 'relation'
  | 'chip'
  | 'double-text-chip'
  | 'double-text'
  | 'number'
  | 'date'
  | 'phone'
  | 'url'
  | 'probability';

export type FieldTextMetadata = {
  type: 'text';
  placeHolder: string;
  fieldName: string;
};

export type FieldPhoneMetadata = {
  type: 'phone';
  placeHolder: string;
  fieldName: string;
};

export type FieldURLMetadata = {
  type: 'url';
  placeHolder: string;
  fieldName: string;
};

export type FieldDateMetadata = {
  type: 'date';
  fieldName: string;
};

export type FieldNumberMetadata = {
  type: 'number';
  fieldName: string;
};

export type FieldRelationMetadata = {
  type: 'relation';
  relationType: Entity;
  fieldName: string;
};

export type FieldChipMetadata = {
  type: 'chip';
  relationType: Entity;
  contentFieldName: string;
  urlFieldName: string;
  placeHolder: string;
};

export type FieldDoubleTextMetadata = {
  type: 'double-text';
  firstValueFieldName: string;
  firstValuePlaceholder: string;
  secondValueFieldName: string;
  secondValuePlaceholder: string;
};

export type FieldDoubleTextChipMetadata = {
  type: 'double-text-chip';
  firstValueFieldName: string;
  firstValuePlaceholder: string;
  secondValueFieldName: string;
  secondValuePlaceholder: string;
  avatarUrlFieldName: string;
  entityType: Entity;
};

export type FieldProbabilityMetadata = {
  type: 'probability';
  fieldName: string;
};

export type FieldMetadata = { type: FieldType } & (
  | FieldTextMetadata
  | FieldRelationMetadata
  | FieldChipMetadata
  | FieldDoubleTextChipMetadata
  | FieldDoubleTextMetadata
  | FieldPhoneMetadata
  | FieldURLMetadata
  | FieldNumberMetadata
  | FieldDateMetadata
  | FieldProbabilityMetadata
);

export type FieldTextValue = string;

export type FieldChipValue = string;
export type FieldDateValue = string;
export type FieldPhoneValue = string;
export type FieldURLValue = string;
export type FieldNumberValue = number | null;
export type FieldProbabilityValue = number;

export type FieldDoubleTextValue = {
  firstValue: string;
  secondValue: string;
};

export type FieldDoubleTextChipValue = {
  firstValue: string;
  secondValue: string;
};

export type FieldRelationValue = EntityForSelect | null;
