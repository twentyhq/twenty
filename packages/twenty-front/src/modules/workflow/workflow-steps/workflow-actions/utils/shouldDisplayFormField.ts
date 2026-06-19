import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { isHiddenSystemField } from '@/object-metadata/utils/isHiddenSystemField';
import {
  type WorkflowActionType,
  type WorkflowTriggerType,
} from '@/workflow/types/Workflow';
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
  FieldMetadataType.MORPH_RELATION,
  FieldMetadataType.RICH_TEXT,
];

// Fields can be picked either for a workflow action (to write them) or for the
// 'DATABASE_EVENT' trigger (to watch them for changes). The two have different
// rules: watching is not editing, so the trigger must not gate on isUIEditable
// (system objects have all fields non-editable and would otherwise be empty).
export type ShouldDisplayFormFieldMode =
  | WorkflowActionType
  | WorkflowTriggerType;

export const shouldDisplayFormField = ({
  fieldMetadataItem,
  actionType,
}: {
  fieldMetadataItem: FieldMetadataItem;
  actionType: ShouldDisplayFormFieldMode;
}) => {
  if (!SUPPORTED_FORM_FIELD_TYPES.includes(fieldMetadataItem.type)) {
    return false;
  }

  const isIdField = fieldMetadataItem.name === 'id';

  const isNotSupportedRelation =
    (fieldMetadataItem.type === FieldMetadataType.RELATION ||
      fieldMetadataItem.type === FieldMetadataType.MORPH_RELATION) &&
    fieldMetadataItem.settings?.['relationType'] !== 'MANY_TO_ONE';

  switch (actionType) {
    case 'CREATE_RECORD':
    case 'UPDATE_RECORD':
      return (
        !isNotSupportedRelation &&
        (fieldMetadataItem.isUIEditable ?? true) &&
        !isHiddenSystemField(fieldMetadataItem) &&
        fieldMetadataItem.isActive
      );
    case 'UPSERT_RECORD':
      return (
        (!isNotSupportedRelation &&
          (fieldMetadataItem.isUIEditable ?? true) &&
          !isHiddenSystemField(fieldMetadataItem) &&
          fieldMetadataItem.isActive) ||
        isIdField
      );
    case 'FIND_RECORDS':
      return (
        !isNotSupportedRelation &&
        (!isHiddenSystemField(fieldMetadataItem) || isIdField) &&
        fieldMetadataItem.isActive
      );
    case 'DATABASE_EVENT':
      return (
        !isNotSupportedRelation &&
        !isHiddenSystemField(fieldMetadataItem) &&
        fieldMetadataItem.isActive
      );
    default:
      throw new CustomError(
        `Action "${actionType}" is not supported`,
        'UNSUPPORTED_ACTION_TYPE',
      );
  }
};
