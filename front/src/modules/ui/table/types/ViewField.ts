import { EntityForSelect } from '@/ui/relation-picker/types/EntityForSelect';
import { Entity } from '@/ui/relation-picker/types/EntityTypeForSelect';

export type ViewFieldType =
  | 'text'
  | 'relation'
  | 'chip'
  | 'double-text-chip'
  | 'double-text';

export type ViewFieldTextMetadata = {
  placeHolder: string;
  fieldName: string;
};

export type ViewFieldRelationMetadata = {
  relationType: Entity;
  fieldName: string;
};

export type ViewFieldChipMetadata = {
  relationType: Entity;
  contentFieldName: string;
  urlFieldName: string;
  placeHolder: string;
};

export type ViewFieldDoubleTextMetadata = {
  firstValueFieldName: string;
  firstValuePlaceholder: string;
  secondValueFieldName: string;
  secondValuePlaceholder: string;
};

export type ViewFieldDoubleTextChipMetadata = {
  firstValueFieldName: string;
  firstValuePlaceholder: string;
  secondValueFieldName: string;
  secondValuePlaceholder: string;
  entityType: Entity;
};

export type ViewFieldMetadata =
  | ViewFieldTextMetadata
  | ViewFieldRelationMetadata
  | ViewFieldChipMetadata
  | ViewFieldDoubleTextChipMetadata
  | ViewFieldDoubleTextMetadata;

export type ViewFieldDefinition<T extends ViewFieldMetadata | unknown> = {
  id: string;
  columnLabel: string;
  columnSize: number;
  columnOrder: number;
  columnIcon?: JSX.Element;
  filterIcon?: JSX.Element;
  type: ViewFieldType;
  metadata: T;
};

export type ViewFieldTextValue = string;

export type ViewFieldChipValue = string;

export type ViewFieldDoubleTextValue = {
  firstValue: string;
  secondValue: string;
};

export type ViewFieldDoubleTextChipValue = {
  firstValue: string;
  secondValue: string;
};

export type ViewFieldRelationValue = EntityForSelect | null;
