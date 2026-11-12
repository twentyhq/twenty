import { useMemo } from 'react';
import { doNotTranslate } from 'twenty-shared/i18n';

import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { formatFieldMetadataItemAsFieldDefinition } from '@/object-metadata/utils/formatFieldMetadataItemAsFieldDefinition';
import { isFieldRelationManyToOne } from '@/object-record/record-field/ui/types/guards/isFieldRelationManyToOne';

export const useToolCallApprovalFieldDefinitions = (
  objectNameSingular: string,
) => {
  const { objectMetadataItem } = useObjectMetadataItem({ objectNameSingular });

  // a many-to-one relation is set through its foreign key
  const fieldDefinitionsByArgumentName = useMemo(
    () =>
      new Map(
        objectMetadataItem.fields.map((field) => {
          const fieldDefinition = formatFieldMetadataItemAsFieldDefinition({
            field,
            objectMetadataItem,
            showLabel: true,
            labelWidth: 90,
          });

          return [
            isFieldRelationManyToOne(fieldDefinition)
              ? doNotTranslate(`${field.name}Id`)
              : field.name,
            fieldDefinition,
          ] as const;
        }),
      ),
    [objectMetadataItem],
  );

  return { objectMetadataItem, fieldDefinitionsByArgumentName };
};
