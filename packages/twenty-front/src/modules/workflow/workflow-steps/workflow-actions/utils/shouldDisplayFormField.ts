import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { isHiddenSystemField } from '@/object-metadata/utils/isHiddenSystemField';
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
  FieldMetadataType.MORPH_RELATION,
  FieldMetadataType.RICH_TEXT,
];

// 'WATCH_FIELDS' is not a workflow action: it is used by the database event
// trigger to pick which fields to watch for changes. Editability is irrelevant
// there, so it must not gate on isUIEditable (system objects have all fields
// non-editable and would otherwise show an empty list).
export type ShouldDisplayFormFieldMode = WorkflowActionType | 'WATCH_FIELDS';

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
    case 'WATCH_FIELDS':
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
