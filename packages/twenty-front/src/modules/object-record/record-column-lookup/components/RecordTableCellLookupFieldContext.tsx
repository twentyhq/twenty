import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { formatFieldMetadataItemAsFieldDefinition } from '@/object-metadata/utils/formatFieldMetadataItemAsFieldDefinition';
import { getObjectPermissionsForObject } from '@/object-metadata/utils/getObjectPermissionsForObject';
import { useUpdateOneRecord } from '@/object-record/hooks/useUpdateOneRecord';
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
import { type ReactNode } from 'react';
import {
  canAccessThroughAllRecordsOrRlsPermission,
  findById,
  isDefined,
} from 'twenty-shared/utils';

type RecordTableCellLookupFieldContextProps = {
  recordFieldId: string;
  fieldMetadataItem: FieldMetadataItem;
  relationObjectMetadataItem: EnrichedObjectMetadataItem;
  lookupTargetFieldMetadataItem: FieldMetadataItem;
  children: ReactNode;
};

export const RecordTableCellLookupFieldContext = ({
  recordFieldId,
  fieldMetadataItem,
  relationObjectMetadataItem,
  lookupTargetFieldMetadataItem,
  children,
}: RecordTableCellLookupFieldContextProps) => {
  const { recordId } = useRecordTableRowContextOrThrow();
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

  const { updateOneRecord } = useUpdateOneRecord();

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

  const fieldDefinition = formatFieldMetadataItemAsFieldDefinition({
    field: lookupTargetFieldMetadataItem,
    objectMetadataItem: relationObjectMetadataItem,
  });

  const isLookupTargetRestricted =
    !relationObjectMetadataItem.readableFields.some(
      findById(lookupTargetFieldMetadataItem.id),
    ) || restrictedFieldNames.includes(lookupTargetFieldMetadataItem.name);

  const updateRelatedRecord = ({ variables }: RecordUpdateHookParams) =>
    updateOneRecord({
      objectNameSingular: relationObjectMetadataItem.nameSingular,
      idToUpdate: relatedRecordId,
      updateOneRecordInput: variables.updateOneRecordInput,
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
