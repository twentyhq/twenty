import { type FieldMetadataType } from 'twenty-shared/types';

export type FindObjectFieldByName = (args: {
  objectUniversalIdentifier: string;
  fieldName: string;
}) => { universalIdentifier: string; type: FieldMetadataType } | undefined;
