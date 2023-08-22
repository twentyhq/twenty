import { EntityForSelect } from '@/ui/input/relation-picker/types/EntityForSelect';
import { Entity } from '@/ui/input/relation-picker/types/EntityTypeForSelect';

export type ViewFieldType =
  | 'text'
  | 'relation'
  | 'chip'
  | 'double-text-chip'
  | 'double-text'
  | 'number'
  | 'date'
  | 'phone'
  | 'url'
  | 'probability'
  | 'boolean'
  | 'moneyAmount';

export type ViewFieldTextMetadata = {
  type: 'text';
  placeHolder: string;
  fieldName: string;
};

export type ViewFieldPhoneMetadata = {
  type: 'phone';
  placeHolder: string;
  fieldName: string;
};

export type ViewFieldURLMetadata = {
  type: 'url';
  placeHolder: string;
  fieldName: string;
};

export type ViewFieldDateMetadata = {
  type: 'date';
  fieldName: string;
};

export type ViewFieldNumberMetadata = {
  type: 'number';
  fieldName: string;
  isPositive?: boolean;
};

export type ViewFieldMoneyMetadata = {
  type: 'moneyAmount';
  fieldName: string;
};

export type ViewFieldBooleanMetadata = {
  type: 'boolean';
  fieldName: string;
};

export type ViewFieldRelationMetadata = {
  type: 'relation';
  relationType: Entity;
  fieldName: string;
  useEditButton?: boolean;
};

export type ViewFieldChipMetadata = {
  type: 'chip';
  relationType: Entity;
  contentFieldName: string;
  urlFieldName: string;
  placeHolder: string;
};

export type ViewFieldDoubleTextMetadata = {
  type: 'double-text';
  firstValueFieldName: string;
  firstValuePlaceholder: string;
  secondValueFieldName: string;
  secondValuePlaceholder: string;
};

export type ViewFieldDoubleTextChipMetadata = {
  type: 'double-text-chip';
  firstValueFieldName: string;
  firstValuePlaceholder: string;
  secondValueFieldName: string;
  secondValuePlaceholder: string;
  avatarUrlFieldName: string;
  entityType: Entity;
};

export type ViewFieldProbabilityMetadata = {
  type: 'probability';
  fieldName: string;
};

export type ViewFieldMetadata = { type: ViewFieldType } & (
  | ViewFieldTextMetadata
  | ViewFieldRelationMetadata
  | ViewFieldChipMetadata
  | ViewFieldDoubleTextChipMetadata
  | ViewFieldDoubleTextMetadata
  | ViewFieldPhoneMetadata
  | ViewFieldURLMetadata
  | ViewFieldNumberMetadata
  | ViewFieldBooleanMetadata
  | ViewFieldDateMetadata
  | ViewFieldProbabilityMetadata
  | ViewFieldMoneyMetadata
);

export type ViewFieldDefinition<T extends ViewFieldMetadata | unknown> = {
  id: string;
  columnLabel: string;
  columnSize: number;
  columnOrder: number;
  columnIcon?: JSX.Element;
  filterIcon?: JSX.Element;
  isVisible?: boolean;
  metadata: T;
};

export type ViewFieldTextValue = string;

export type ViewFieldChipValue = string;
export type ViewFieldDateValue = string;
export type ViewFieldPhoneValue = string;
export type ViewFieldBooleanValue = boolean;
export type ViewFieldMoneyValue = number;
export type ViewFieldURLValue = string;
export type ViewFieldNumberValue = number | null;
export type ViewFieldProbabilityValue = number;

export type ViewFieldDoubleTextValue = {
  firstValue: string;
  secondValue: string;
};

export type ViewFieldDoubleTextChipValue = {
  firstValue: string;
  secondValue: string;
};

export type ViewFieldRelationValue = EntityForSelect | null;
