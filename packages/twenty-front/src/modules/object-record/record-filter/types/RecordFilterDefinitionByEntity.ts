import { RecordFilterDefinition } from './RecordFilterDefinition';

export type RecordFilterDefinitionByEntity<T> = RecordFilterDefinition & {
  fieldMetadataId: keyof T;
};
