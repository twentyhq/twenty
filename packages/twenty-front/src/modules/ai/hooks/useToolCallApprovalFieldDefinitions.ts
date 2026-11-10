import { useMemo } from 'react';
import { doNotTranslate } from 'twenty-shared/i18n';
import { isDefined } from 'twenty-shared/utils';

import { objectMetadataItemFamilySelector } from '@/object-metadata/states/objectMetadataItemFamilySelector';
import { formatFieldMetadataItemAsFieldDefinition } from '@/object-metadata/utils/formatFieldMetadataItemAsFieldDefinition';
import { isFieldRelationManyToOne } from '@/object-record/record-field/ui/types/guards/isFieldRelationManyToOne';
import { useAtomFamilySelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilySelectorValue';

export const useToolCallApprovalFieldDefinitions = (
  objectNameSingular: string,
) => {
  const objectMetadataItem = useAtomFamilySelectorValue(
    objectMetadataItemFamilySelector,
    { objectName: objectNameSingular, objectNameType: 'singular' },
  );

  // a many-to-one relation is set through its foreign key
  const fieldDefinitionsByArgumentName = useMemo(
    () =>
      new Map(
        isDefined(objectMetadataItem)
          ? objectMetadataItem.fields.map((field) => {
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
            })
          : [],
      ),
    [objectMetadataItem],
  );

  return { objectMetadataItem, fieldDefinitionsByArgumentName };
};
