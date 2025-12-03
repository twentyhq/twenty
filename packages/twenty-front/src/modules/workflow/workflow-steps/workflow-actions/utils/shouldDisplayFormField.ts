import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { type WorkflowActionType } from '@/workflow/types/Workflow';
import { CustomError } from 'twenty-shared/utils';
import { FieldMetadataType } from '~/generated-metadata/graphql';

const SUPPORTED_FORM_FIELD_TYPES = [
  FieldMetadataType.TEXT,
  FieldMetadataType.NUMBER,
  FieldMetadataType.DATE,
  FieldMetadataType.BOOLEAN,
  FieldMetadataType.SELECT,
  FieldMetadataType.MULTI_SELECT,
  FieldMetadataType.EMAILS,
  FieldMetadataType.LINKS,
  FieldMetadataType.FULL_NAME,
  FieldMetadataType.ADDRESS,
  FieldMetadataType.PHONES,
  FieldMetadataType.CURRENCY,
  FieldMetadataType.DATE_TIME,
  FieldMetadataType.RAW_JSON,
  FieldMetadataType.UUID,
  FieldMetadataType.ARRAY,
  FieldMetadataType.RELATION,
  FieldMetadataType.RICH_TEXT_V2,
];

export const shouldDisplayFormField = ({
  fieldMetadataItem,
  actionType,
}: {
  fieldMetadataItem: FieldMetadataItem;
  actionType: WorkflowActionType;
}) => {
  if (!SUPPORTED_FORM_FIELD_TYPES.includes(fieldMetadataItem.type)) {
    return false;
  }

  const isIdField = fieldMetadataItem.name === 'id';
  const isNotSupportedRelation =
    fieldMetadataItem.type === FieldMetadataType.RELATION &&
    fieldMetadataItem.settings?.['relationType'] !== 'MANY_TO_ONE';

  switch (actionType) {
    case 'CREATE_RECORD':
    case 'UPDATE_RECORD':
      return (
        !isNotSupportedRelation &&
        !fieldMetadataItem.isUIReadOnly &&
        !fieldMetadataItem.isSystem &&
        fieldMetadataItem.isActive
      );
    case 'UPSERT_RECORD':
      return (
        (!isNotSupportedRelation &&
          !fieldMetadataItem.isUIReadOnly &&
          !fieldMetadataItem.isSystem &&
          fieldMetadataItem.isActive) ||
        isIdField
      );
    case 'FIND_RECORDS':
      return (
        !isNotSupportedRelation &&
        (!fieldMetadataItem.isSystem || isIdField) &&
        fieldMetadataItem.isActive
      );
    default:
      throw new CustomError(
        `Action "${actionType}" is not supported`,
        'UNSUPPORTED_ACTION_TYPE',
      );
  }
};
