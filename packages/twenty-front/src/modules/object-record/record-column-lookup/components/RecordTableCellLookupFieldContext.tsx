import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { getObjectPermissionsForObject } from '@/object-metadata/utils/getObjectPermissionsForObject';
import { type RecordFieldLookupTarget } from '@/object-record/record-column-lookup/utils/getRecordFieldLookupTarget';
import { useIsRecordReadOnly } from '@/object-record/read-only/hooks/useIsRecordReadOnly';
import { isRecordFieldReadOnly } from '@/object-record/read-only/utils/isRecordFieldReadOnly';
import {
  FieldContext,
  type RecordUpdateHookParams,
} from '@/object-record/record-field/ui/contexts/FieldContext';
import { RecordFieldComponentInstanceContext } from '@/object-record/record-field/ui/states/contexts/RecordFieldComponentInstanceContext';
import { useRecordIndexContextOrThrow } from '@/object-record/record-index/contexts/RecordIndexContext';
import { useRecordFieldValue } from '@/object-record/record-store/hooks/useRecordFieldValue';
import { useRecordRestrictedFieldNames } from '@/object-record/record-store/hooks/useRecordRestrictedFieldNames';
import { useRecordTableRowContextOrThrow } from '@/object-record/record-table/contexts/RecordTableRowContext';
import { isRecordTableCellsNonEditableComponentState } from '@/object-record/record-table/states/isRecordTableCellsNonEditableComponentState';
import { getRecordTableCellInputIdPrefix } from '@/object-record/record-table/utils/getRecordTableCellInputIdPrefix';
import { type ObjectRecord } from '@/object-record/types/ObjectRecord';
import { getRecordFieldInputInstanceId } from '@/object-record/utils/getRecordFieldInputId';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { RecordTableUpdateContext } from '@/object-record/record-table/contexts/RecordTableUpdateContext';
import { type ReactNode, useContext } from 'react';
import {
  canAccessThroughAllRecordsOrRlsPermission,
  findById,
  isDefined,
} from 'twenty-shared/utils';

type RecordTableCellLookupFieldContextProps = {
  recordFieldId: string;
  fieldMetadataItem: FieldMetadataItem;
  lookupTarget: RecordFieldLookupTarget;
  children: ReactNode;
};

export const RecordTableCellLookupFieldContext = ({
  recordFieldId,
  fieldMetadataItem,
  lookupTarget: {
    relationObjectMetadataItem,
    lookupTargetFieldMetadataItem,
    lookupTargetFieldDefinition: fieldDefinition,
  },
  children,
}: RecordTableCellLookupFieldContextProps) => {
  const { recordId, isRecordReadOnly: isRowReadOnly } =
    useRecordTableRowContextOrThrow();
  const {
    objectPermissionsByObjectMetadataId,
    fieldDefinitionByFieldMetadataItemId,
  } = useRecordIndexContextOrThrow();

  const relatedRecord = useRecordFieldValue<ObjectRecord | null>(
    recordId,
    fieldMetadataItem.name,
    fieldDefinitionByFieldMetadataItemId[fieldMetadataItem.id],
  );

  const relatedRecordId = relatedRecord?.id ?? '';

  const restrictedFieldNames = useRecordRestrictedFieldNames(relatedRecordId);

  const updateRecord = useContext(RecordTableUpdateContext);

  const isRelatedRecordReadOnly = useIsRecordReadOnly({
    recordId: relatedRecordId,
    objectMetadataId: relationObjectMetadataItem.id,
  });

  const isRecordTableCellsNonEditable = useAtomComponentStateValue(
    isRecordTableCellsNonEditableComponentState,
  );

  const canReadRelatedRecord = canAccessThroughAllRecordsOrRlsPermission({
    objectRecordsPermissions: getObjectPermissionsForObject(
      objectPermissionsByObjectMetadataId,
      relationObjectMetadataItem.id,
    ),
    operationType: 'read',
  });

  const isLookupTargetRestricted =
    !relationObjectMetadataItem.readableFields.some(
      findById(lookupTargetFieldMetadataItem.id),
    ) || restrictedFieldNames.includes(lookupTargetFieldMetadataItem.name);

  const updateRelatedRecord = (params: RecordUpdateHookParams) =>
    updateRecord?.({
      ...params,
      objectNameSingular: relationObjectMetadataItem.nameSingular,
    });

  return (
    <RecordFieldComponentInstanceContext.Provider
      value={{
        instanceId: getRecordFieldInputInstanceId({
          recordId: relatedRecordId,
          fieldName: lookupTargetFieldMetadataItem.name,
          prefix: getRecordTableCellInputIdPrefix(recordFieldId),
        }),
      }}
    >
      <FieldContext.Provider
        value={{
          fieldMetadataItemId: lookupTargetFieldMetadataItem.id,
          recordId: relatedRecordId,
          fieldDefinition,
          useUpdateRecord: () => [updateRelatedRecord, {}],
          isLabelIdentifier: false,
          displayedMaxRows: 1,
          isRecordFieldReadOnly:
            !isDefined(relatedRecord) ||
            isRowReadOnly ||
            isRecordTableCellsNonEditable ||
            isLookupTargetRestricted ||
            isRecordFieldReadOnly({
              isRecordReadOnly: isRelatedRecordReadOnly,
              objectMetadataId: relationObjectMetadataItem.id,
              fieldMetadataItem: lookupTargetFieldMetadataItem,
              fieldDefinition,
              objectPermissionsByObjectMetadataId,
            }),
          isForbidden: !canReadRelatedRecord || isLookupTargetRestricted,
        }}
      >
        {children}
      </FieldContext.Provider>
    </RecordFieldComponentInstanceContext.Provider>
  );
};
