import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { formatFieldMetadataItemAsFieldDefinition } from '@/object-metadata/utils/formatFieldMetadataItemAsFieldDefinition';
import { getObjectPermissionsForObject } from '@/object-metadata/utils/getObjectPermissionsForObject';
import { useIsRecordReadOnly } from '@/object-record/read-only/hooks/useIsRecordReadOnly';
import { isRecordFieldReadOnly } from '@/object-record/read-only/utils/isRecordFieldReadOnly';
import {
  FieldContext,
  type GenericFieldContextType,
  type RecordUpdateHookParams,
} from '@/object-record/record-field/ui/contexts/FieldContext';
import { RecordFieldComponentInstanceContext } from '@/object-record/record-field/ui/states/contexts/RecordFieldComponentInstanceContext';
import { useRecordIndexContextOrThrow } from '@/object-record/record-index/contexts/RecordIndexContext';
import { useRecordFieldValue } from '@/object-record/record-store/hooks/useRecordFieldValue';
import { useRecordRestrictedFieldNames } from '@/object-record/record-store/hooks/useRecordRestrictedFieldNames';
import { type ObjectRecord } from '@/object-record/types/ObjectRecord';
import { getRecordFieldInputInstanceId } from '@/object-record/utils/getRecordFieldInputId';
import { RecordTableUpdateContext } from '@/object-record/record-table/contexts/RecordTableUpdateContext';
import { type ReactNode, useContext } from 'react';
import {
  canAccessThroughAllRecordsOrRlsPermission,
  findById,
  isDefined,
} from 'twenty-shared/utils';

type RecordFieldLookupFieldContextProps = {
  recordId: string;
  fieldMetadataItem: FieldMetadataItem;
  relationObjectMetadataItem: EnrichedObjectMetadataItem;
  lookupTargetFieldMetadataItem: FieldMetadataItem;
  instanceIdPrefix: string;
  isNonEditable: boolean;
  label?: string;
  children: ReactNode;
} & Pick<
  GenericFieldContextType,
  | 'displayedMaxRows'
  | 'maxWidth'
  | 'isDisplayModeFixHeight'
  | 'triggerEvent'
  | 'anchorId'
  | 'onOpenEditMode'
>;

export const RecordFieldLookupFieldContext = ({
  recordId,
  fieldMetadataItem,
  relationObjectMetadataItem,
  lookupTargetFieldMetadataItem,
  instanceIdPrefix,
  isNonEditable,
  label,
  displayedMaxRows,
  maxWidth,
  isDisplayModeFixHeight,
  triggerEvent,
  anchorId,
  onOpenEditMode,
  children,
}: RecordFieldLookupFieldContextProps) => {
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

  const canReadRelatedRecord = canAccessThroughAllRecordsOrRlsPermission({
    objectRecordsPermissions: getObjectPermissionsForObject(
      objectPermissionsByObjectMetadataId,
      relationObjectMetadataItem.id,
    ),
    operationType: 'read',
  });

  const lookupTargetFieldDefinition = formatFieldMetadataItemAsFieldDefinition({
    field: lookupTargetFieldMetadataItem,
    objectMetadataItem: relationObjectMetadataItem,
  });

  const fieldDefinition = {
    ...lookupTargetFieldDefinition,
    label: label ?? lookupTargetFieldDefinition.label,
  };

  const isLookupTargetRestricted =
    !relationObjectMetadataItem.readableFields.some(
      findById(lookupTargetFieldMetadataItem.id),
    ) || restrictedFieldNames.includes(lookupTargetFieldMetadataItem.name);

  const updateRelatedRecord = (params: RecordUpdateHookParams) =>
    updateRecord?.(params, relationObjectMetadataItem.nameSingular);

  return (
    <RecordFieldComponentInstanceContext.Provider
      value={{
        instanceId: getRecordFieldInputInstanceId({
          recordId: relatedRecordId,
          fieldName: lookupTargetFieldMetadataItem.name,
          prefix: instanceIdPrefix,
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
          isRecordFieldReadOnly:
            !isDefined(relatedRecord) ||
            isNonEditable ||
            isLookupTargetRestricted ||
            isRecordFieldReadOnly({
              isRecordReadOnly: isRelatedRecordReadOnly,
              objectMetadataId: relationObjectMetadataItem.id,
              fieldMetadataItem: lookupTargetFieldMetadataItem,
              fieldDefinition,
              objectPermissionsByObjectMetadataId,
            }),
          isForbidden: !canReadRelatedRecord || isLookupTargetRestricted,
          displayedMaxRows,
          maxWidth,
          isDisplayModeFixHeight,
          triggerEvent,
          anchorId,
          onOpenEditMode,
        }}
      >
        {children}
      </FieldContext.Provider>
    </RecordFieldComponentInstanceContext.Provider>
  );
};
