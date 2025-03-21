import { FieldMetadataType } from 'twenty-shared';
import { JsonValue } from 'type-fest';

export type WorkflowFormActionField = {
  id: string;
  name: string;
  label: string;
  type: FieldMetadataType.TEXT | FieldMetadataType.NUMBER;
  placeholder?: string;
  settings?: Record<string, unknown>;
  value?: JsonValue;
};
