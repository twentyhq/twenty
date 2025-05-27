import { FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { WorkflowActionType } from '@/workflow/types/Workflow';
import { FieldMetadataType } from '~/generated/graphql';

const DISPLAYABLE_FIELD_TYPES_FOR_UPDATE = [
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
        fieldMetadataItem.type !== FieldMetadataType.RELATION;
      break;
    case 'UPDATE_RECORD':
      isTypeAllowedForAction = DISPLAYABLE_FIELD_TYPES_FOR_UPDATE.includes(
        fieldMetadataItem.type,
      );
      break;
    default:
      throw new Error(`Action "${actionType}" is not supported`);
  }
  return (
    (isTypeAllowedForAction ||
      fieldMetadataItem.settings?.['relationType'] === 'MANY_TO_ONE') &&
    !fieldMetadataItem.isSystem &&
    fieldMetadataItem.isActive
  );
};
