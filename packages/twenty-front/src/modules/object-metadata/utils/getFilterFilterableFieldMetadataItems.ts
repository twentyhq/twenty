import { FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import {
  FieldMetadataType,
  RelationDefinitionType,
} from '~/generated-metadata/graphql';

export const getFilterFilterableFieldMetadataItems = ({
  isJsonFilterEnabled,
}: {
  isJsonFilterEnabled: boolean;
}) => {
  return (field: FieldMetadataItem) => {
    const isSystemField = field.isSystem;
    const isFieldActive = field.isActive;

    const isRelationFieldHandled = !(
      field.type === FieldMetadataType.RELATION &&
      field.relationDefinition?.direction !==
        RelationDefinitionType.MANY_TO_ONE &&
      field.relationDefinition?.direction !== RelationDefinitionType.ONE_TO_ONE
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
      ...(isJsonFilterEnabled ? [FieldMetadataType.RAW_JSON] : []),
    ].includes(field.type);

    const isFieldFilterable =
      !isSystemField &&
      isFieldActive &&
      isRelationFieldHandled &&
      isFieldTypeFilterable;

    return isFieldFilterable;
  };
};
