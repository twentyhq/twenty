import { FieldDefinition } from './FieldDefinition';
import { FieldMetadata } from './FieldMetadata';

export type FieldDefinitionSerializable = Omit<
  FieldDefinition<FieldMetadata>,
  'Icon'
>;
