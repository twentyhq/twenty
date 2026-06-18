import { isNonEmptyArray } from '@sniptt/guards';
import {
  isRecordArraySchema,
  isRecordObjectSchema,
} from 'twenty-shared/logic-function';
import { FieldMetadataType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { type InputSchemaProperty } from 'twenty-shared/workflow';

type WorkflowCodeFieldsLeafKind =
  | 'boolean'
  | 'enum'
  | 'number'
  | 'record'
  | 'record-array'
  | 'text';

export const getWorkflowCodeFieldsLeafKind = (
  property: InputSchemaProperty | undefined,
): WorkflowCodeFieldsLeafKind => {
  if (!isDefined(property)) {
    return 'text';
  }

  if (isRecordObjectSchema(property)) {
    return 'record';
  }

  if (isRecordArraySchema(property)) {
    return 'record-array';
  }

  if (
    (property.type === 'string' || property.type === FieldMetadataType.TEXT) &&
    isNonEmptyArray(property.enum)
  ) {
    return 'enum';
  }

  switch (property.type) {
    case 'boolean':
    case FieldMetadataType.BOOLEAN:
      return 'boolean';
    case 'number':
    case FieldMetadataType.NUMBER:
    case FieldMetadataType.NUMERIC:
      return 'number';
    default:
      return 'text';
  }
};
