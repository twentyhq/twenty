import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { type RecordGqlFields } from 'twenty-shared/types';

export type ReadableRelationWithArguments = {
  fieldMetadataItem: FieldMetadataItem;
  recordGqlFields: RecordGqlFields;
  selectionHead: string;
  connectionGqlFieldNames: string[];
  variableDefinitions: string;
  variables: Record<string, unknown>;
};
