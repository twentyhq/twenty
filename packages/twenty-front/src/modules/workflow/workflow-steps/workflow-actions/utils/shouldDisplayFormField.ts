import { FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { WorkflowActionType } from '@/workflow/types/Workflow';
import { FieldMetadataType } from '~/generated/graphql';

const COMMON_DISPLAYABLE_FIELD_TYPES = [
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
];

const FIND_RECORDS_DISPLAYABLE_FIELD_TYPES = [
  ...COMMON_DISPLAYABLE_FIELD_TYPES,
  FieldMetadataType.ARRAY,
  FieldMetadataType.RELATION,
];

export const shouldDisplayFormField = ({
  fieldMetadataItem,
  actionType,
}: {
  fieldMetadataItem: FieldMetadataItem;
  actionType: WorkflowActionType;
}) => {
  let isTypeAllowedForAction = false;

  switch (actionType) {
    case 'CREATE_RECORD':
      isTypeAllowedForAction =
        fieldMetadataItem.type !== FieldMetadataType.RELATION ||
        fieldMetadataItem.settings?.['relationType'] === 'MANY_TO_ONE';
      break;
    case 'UPDATE_RECORD':
      isTypeAllowedForAction =
        COMMON_DISPLAYABLE_FIELD_TYPES.includes(fieldMetadataItem.type) ||
        fieldMetadataItem.settings?.['relationType'] === 'MANY_TO_ONE';
      break;
    case 'FIND_RECORDS':
      isTypeAllowedForAction = FIND_RECORDS_DISPLAYABLE_FIELD_TYPES.includes(
        fieldMetadataItem.type,
      );
      break;
    default:
      throw new Error(`Action "${actionType}" is not supported`);
  }

  return (
    isTypeAllowedForAction &&
    (!fieldMetadataItem.isSystem || fieldMetadataItem.name === 'id') &&
    fieldMetadataItem.isActive
  );
};
