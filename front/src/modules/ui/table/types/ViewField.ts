import { Entity } from '@/ui/relation-picker/types/EntityTypeForSelect';

export type ViewFieldType = 'text' | 'relation' | 'chip';

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
};

export type ViewFieldDefinition<
  T extends
    | ViewFieldTextMetadata
    | ViewFieldRelationMetadata
    | ViewFieldChipMetadata
    | unknown,
> = {
  id: string;
  columnLabel: string;
  columnSize: number;
  columnOrder: number;
  columnIcon?: JSX.Element;
  filterIcon?: JSX.Element;
  type: ViewFieldType;
  metadata: T;
};
