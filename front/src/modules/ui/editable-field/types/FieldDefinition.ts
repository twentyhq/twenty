import { FieldMetadata } from './FieldMetadata';

export type FieldDefinition<T extends FieldMetadata | unknown> = {
  id: string;
  label: string;
  icon?: JSX.Element;
  type: string;
  isVisible?: boolean;
  metadata: T;
};
