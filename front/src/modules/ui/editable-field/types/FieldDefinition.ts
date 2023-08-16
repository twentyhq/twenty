import { FieldMetadata, FieldType } from './FieldMetadata';

export type FieldDefinition<T extends FieldMetadata | unknown> = {
  id: string;
  label: string;
  icon?: JSX.Element;
  type: FieldType;
  metadata: T;
};
