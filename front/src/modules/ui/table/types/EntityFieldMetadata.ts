import { Entity } from '@/ui/relation-picker/types/EntityTypeForSelect';

export type EntityFieldType = 'text' | 'relation' | 'chip';

export type EntityFieldTextMetadata = {
  placeHolder: string;
  fieldName: string;
};

export type EntityFieldRelationMetadata = {
  relationType: Entity;
  fieldName: string;
};

export type EntityFieldChipMetadata = {
  relationType: Entity;
  contentFieldName: string;
  urlFieldName: string;
};

export type EntityFieldDefinition<
  T extends
    | EntityFieldTextMetadata
    | EntityFieldRelationMetadata
    | EntityFieldChipMetadata
    | unknown,
> = {
  columnLabel: string;
  columnSize: number;
  columnOrder: number;
  columnIcon?: JSX.Element;
  filterIcon?: JSX.Element;
  type: EntityFieldType;
  fieldName: string;
  metadata: T;
};
