import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { FieldMetadataType, RelationType } from '~/generated-metadata/graphql';

export const getFilterFilterableFieldMetadataItems = ({
  isJsonFilterEnabled,
}: {
  isJsonFilterEnabled: boolean;
}) => {
  return (field: FieldMetadataItem) => {
    const isSystemField = field.isSystem;
    const isFieldActive = field.isActive;
    const isIdField = field.name === 'id';

    const isWorkflowRelationField =
      field.type === FieldMetadataType.RELATION &&
      (field.name === 'workflow' || field.name === 'workflowVersion');

    const isRelationFieldHandled = !(
      field.type === FieldMetadataType.RELATION &&
      field.relation?.type !== RelationType.MANY_TO_ONE
    );

    const isFieldTypeFilterable = [
      FieldMetadataType.BOOLEAN,
      FieldMetadataType.DATE_TIME,
      FieldMetadataType.DATE,
      FieldMetadataType.TEXT,
      FieldMetadataType.EMAILS,
      FieldMetadataType.NUMBER,
      FieldMetadataType.LINKS,
      FieldMetadataType.FULL_NAME,
      FieldMetadataType.ADDRESS,
      FieldMetadataType.RELATION,
      FieldMetadataType.SELECT,
      FieldMetadataType.MULTI_SELECT,
      FieldMetadataType.CURRENCY,
      FieldMetadataType.RATING,
      FieldMetadataType.ACTOR,
      FieldMetadataType.PHONES,
      FieldMetadataType.ARRAY,
      FieldMetadataType.UUID,
      ...(isJsonFilterEnabled ? [FieldMetadataType.RAW_JSON] : []),
    ].includes(field.type);

    const isFieldFilterable =
      (!isSystemField || isIdField || isWorkflowRelationField) &&
      isFieldActive &&
      isRelationFieldHandled &&
      isFieldTypeFilterable;

    return isFieldFilterable;
  };
};
