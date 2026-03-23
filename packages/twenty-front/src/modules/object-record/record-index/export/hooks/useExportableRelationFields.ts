import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import {
  buildExportableRelationFieldPaths,
  type ExportableRelationFieldPath,
} from '@/object-record/record-index/export/utils/relationExportFieldPaths';
import { useMemo } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { FieldMetadataType, RelationType } from '~/generated-metadata/graphql';

type ExportableRelationField = {
  fieldName: string;
  fieldLabel: string;
  targetObjectNameSingular: string;
  targetObjectLabel: string;
  exportableSubFields: ExportableRelationFieldPath[];
};

export const useExportableRelationFields = ({
  objectMetadataItem,
  visibleFieldNames,
}: {
  objectMetadataItem: EnrichedObjectMetadataItem;
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

        const exportableSubFields = buildExportableRelationFieldPaths({
          objectMetadataItem: targetObjectMetadataItem,
          objectMetadataItems,
        });

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
