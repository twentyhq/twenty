import { JsonValue } from 'type-fest';
import { FieldMetadataType } from 'twenty-shared/types';

export type WorkflowFormActionField = {
  id: string;
  name: string;
  label: string;
  type: FieldMetadataType.TEXT | FieldMetadataType.NUMBER;
  placeholder?: string;
  settings?: Record<string, unknown>;
  value?: JsonValue;
};
