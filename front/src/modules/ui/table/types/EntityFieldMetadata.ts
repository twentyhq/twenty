import { Entity } from '@/ui/relation-picker/types/EntityTypeForSelect';

export type EntityFieldType = 'text' | 'relation';

export type EntityFieldMetadata = {
  fieldName: string;
  label: string;
  type: EntityFieldType;
  icon: JSX.Element;
  columnSize: number;
  filterIcon?: JSX.Element;
  relationType?: Entity; // TODO: condition this type with type === "relation"
};
