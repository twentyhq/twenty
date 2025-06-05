import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { getObjectPermissionsForObject } from '@/object-metadata/utils/getObjectPermissionsForObject';
import { isLabelIdentifierField } from '@/object-metadata/utils/isLabelIdentifierField';
import { useObjectPermissions } from '@/object-record/hooks/useObjectPermissions';
import { FieldContext } from '@/object-record/record-field/contexts/FieldContext';
import { useIsFieldValueReadOnly } from '@/object-record/record-field/hooks/useIsFieldValueReadOnly';
import { isFieldRelationFromManyObjects } from '@/object-record/record-field/types/guards/isFieldRelationFromManyObjects';
import { isFieldRelationToOneObject } from '@/object-record/record-field/types/guards/isFieldRelationToOneObject';
import { useRecordIndexContextOrThrow } from '@/object-record/record-index/contexts/RecordIndexContext';
import { RecordUpdateContext } from '@/object-record/record-table/contexts/EntityUpdateMutationHookContext';
import { RecordTableCellContext } from '@/object-record/record-table/contexts/RecordTableCellContext';
import { useRecordTableContextOrThrow } from '@/object-record/record-table/contexts/RecordTableContext';
import { useRecordTableRowContextOrThrow } from '@/object-record/record-table/contexts/RecordTableRowContext';
import { ReactNode, useContext } from 'react';
import { isDefined } from 'twenty-shared/utils';

type RecordTableCellFieldContextGenericProps = {
  children: ReactNode;
};

export const RecordTableCellFieldContextGeneric = ({
  children,
}: RecordTableCellFieldContextGenericProps) => {
  const { recordId, isReadOnly: isTableRowReadOnly } =
    useRecordTableRowContextOrThrow();

  const { objectMetadataItem } = useRecordTableContextOrThrow();
  const { indexIdentifierUrl } = useRecordIndexContextOrThrow();
  const { columnDefinition } = useContext(RecordTableCellContext);

  const isFieldReadOnly = useIsFieldValueReadOnly({
    fieldDefinition: columnDefinition,
    isRecordReadOnly: isTableRowReadOnly ?? false,
  });

  const updateRecord = useContext(RecordUpdateContext);

  const { objectMetadataItems } = useObjectMetadataItems();

  const { objectPermissionsByObjectMetadataId } = useObjectPermissions();

  const objectPermissions = getObjectPermissionsForObject(
    objectPermissionsByObjectMetadataId,
    objectMetadataItem.id,
  );

  let hasObjectReadPermissions = objectPermissions.canReadObjectRecords;

  if (
    isFieldRelationToOneObject(columnDefinition) ||
    isFieldRelationFromManyObjects(columnDefinition)
  ) {
    const relationObjectMetadataNameSingular =
      columnDefinition.metadata.relationObjectMetadataNameSingular;

    if (isDefined(relationObjectMetadataNameSingular)) {
      const relationObjectMetadataId = objectMetadataItems.find(
        (item) => item.nameSingular === relationObjectMetadataNameSingular,
      )?.id;

      if (isDefined(relationObjectMetadataId)) {
        const relationObjectPermissions = getObjectPermissionsForObject(
          objectPermissionsByObjectMetadataId,
          relationObjectMetadataId,
        );

        hasObjectReadPermissions =
          relationObjectPermissions.canReadObjectRecords;
      }
    }
  }

  return (
    <FieldContext.Provider
      value={{
        recordId,
        fieldDefinition: columnDefinition,
        useUpdateRecord: () => [updateRecord, {}],
        labelIdentifierLink: indexIdentifierUrl(recordId),
        isLabelIdentifier: isLabelIdentifierField({
          fieldMetadataItem: {
            id: columnDefinition.fieldMetadataId,
            name: columnDefinition.metadata.fieldName,
          },
          objectMetadataItem,
        }),
        displayedMaxRows: 1,
        isReadOnly: isFieldReadOnly,
        isForbidden: !hasObjectReadPermissions,
      }}
    >
      {children}
    </FieldContext.Provider>
  );
};
