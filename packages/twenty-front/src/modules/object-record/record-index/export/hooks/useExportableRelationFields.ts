import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { useMemo } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { FieldMetadataType, RelationType } from '~/generated-metadata/graphql';

type ExportableRelationField = {
  fieldName: string;
  fieldLabel: string;
  targetObjectNameSingular: string;
  targetObjectLabel: string;
  exportableSubFields: {
    fieldName: string;
    fieldLabel: string;
    fieldType: FieldMetadataType;
  }[];
};

const EXCLUDED_FIELD_NAMES = new Set([
  'createdAt',
  'updatedAt',
  'deletedAt',
  'position',
  'id',
]);

const EXPORTABLE_FIELD_TYPES = new Set([
  FieldMetadataType.TEXT,
  FieldMetadataType.NUMBER,
  FieldMetadataType.DATE_TIME,
  FieldMetadataType.DATE,
  FieldMetadataType.BOOLEAN,
  FieldMetadataType.PHONES,
  FieldMetadataType.EMAILS,
  FieldMetadataType.FULL_NAME,
  FieldMetadataType.ADDRESS,
  FieldMetadataType.CURRENCY,
  FieldMetadataType.LINKS,
  FieldMetadataType.SELECT,
  FieldMetadataType.MULTI_SELECT,
  FieldMetadataType.RATING,
  FieldMetadataType.UUID,
]);

const isExportableField = (field: FieldMetadataItem): boolean => {
  if (field.isActive === false || field.isSystem === true) {
    return false;
  }
  if (EXCLUDED_FIELD_NAMES.has(field.name)) {
    return false;
  }
  if (field.type === FieldMetadataType.RELATION) {
    return false;
  }
  if (field.type === FieldMetadataType.ACTOR) {
    return false;
  }
  if (field.type === FieldMetadataType.RICH_TEXT_V2) {
    return false;
  }
  if (field.type === FieldMetadataType.FILES) {
    return false;
  }
  return EXPORTABLE_FIELD_TYPES.has(field.type as FieldMetadataType);
};

export const useExportableRelationFields = ({
  objectMetadataItem,
  visibleFieldNames,
}: {
  objectMetadataItem: ObjectMetadataItem;
  visibleFieldNames: string[];
}): ExportableRelationField[] => {
  const { objectMetadataItems } = useObjectMetadataItems();

  return useMemo(() => {
    const relationFields = objectMetadataItem.fields.filter(
      (field) =>
        field.type === FieldMetadataType.RELATION &&
        field.relation?.type === RelationType.MANY_TO_ONE &&
        visibleFieldNames.includes(field.name),
    );

    return relationFields
      .map((field) => {
        const targetObjectNameSingular =
          field.relation?.targetObjectMetadata?.nameSingular;

        if (!isDefined(targetObjectNameSingular)) {
          return null;
        }

        const targetObjectMetadataItem = objectMetadataItems.find(
          (item) => item.nameSingular === targetObjectNameSingular,
        );

        if (!isDefined(targetObjectMetadataItem)) {
          return null;
        }

        const exportableSubFields = targetObjectMetadataItem.fields
          .filter(isExportableField)
          .map((subField) => ({
            fieldName: subField.name,
            fieldLabel: subField.label,
            fieldType: subField.type as FieldMetadataType,
          }));

        if (exportableSubFields.length === 0) {
          return null;
        }

        return {
          fieldName: field.name,
          fieldLabel: field.label,
          targetObjectNameSingular,
          targetObjectLabel: targetObjectMetadataItem.labelSingular,
          exportableSubFields,
        };
      })
      .filter(isDefined);
  }, [objectMetadataItem.fields, objectMetadataItems, visibleFieldNames]);
};
