import { useGetIsMetadataItemFromStandardApplication } from '@/object-metadata/hooks/useGetIsMetadataItemFromStandardApplication';
import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { formatFieldMetadataItemAsColumnDefinition } from '@/object-metadata/utils/formatFieldMetadataItemAsColumnDefinition';
import { isRecordFieldReadOnly } from '@/object-record/read-only/utils/isRecordFieldReadOnly';
import {
  FieldContext,
  type RecordUpdateHook,
} from '@/object-record/record-field/ui/contexts/FieldContext';
import { RecordFieldComponentInstanceContext } from '@/object-record/record-field/ui/states/contexts/RecordFieldComponentInstanceContext';
import { isJunctionRelationForbidden } from '@/object-record/record-field/ui/utils/junction/isJunctionRelationForbidden';
import { RecordInlineCell } from '@/object-record/record-inline-cell/components/RecordInlineCell';
import { getRecordFieldInputInstanceId } from '@/object-record/utils/getRecordFieldInputId';
import { getObjectPermissionsFromMapByObjectMetadataId } from '@/settings/roles/role-permissions/objects-permissions/utils/getObjectPermissionsFromMapByObjectMetadataId';
import { type ObjectPermissions } from 'twenty-shared/types';

type FieldsWidgetFieldItemProps = {
  fieldMetadataItem: FieldMetadataItem;
  globalIndex: number;
  recordId: string;
  objectMetadataItem: EnrichedObjectMetadataItem;
  objectMetadataItems: EnrichedObjectMetadataItem[];
  objectPermissionsByObjectMetadataId: Record<
    string,
    ObjectPermissions & { objectMetadataId: string }
  >;
  isRecordReadOnly: boolean;
  useUpdateRecord: RecordUpdateHook;
  recordLoading: boolean;
  instanceId: string;
  onMouseEnter: () => void;
};

export const FieldsWidgetFieldItem = ({
  fieldMetadataItem,
  globalIndex,
  recordId,
  objectMetadataItem,
  objectMetadataItems,
  objectPermissionsByObjectMetadataId,
  isRecordReadOnly,
  useUpdateRecord,
  recordLoading,
  instanceId,
  onMouseEnter,
}: FieldsWidgetFieldItemProps) => {
  const getIsMetadataItemFromStandardApplication =
    useGetIsMetadataItemFromStandardApplication();

  const fieldDefinition = formatFieldMetadataItemAsColumnDefinition({
    field: fieldMetadataItem,
    position: globalIndex,
    objectMetadataItem,
    showLabel: true,
    labelWidth: 90,
  });

  return (
    <FieldContext.Provider
      key={recordId + fieldMetadataItem.id}
      value={{
        recordId,
        maxWidth: 200,
        isLabelIdentifier: false,
        fieldDefinition,
        useUpdateRecord,
        isDisplayModeFixHeight: true,
        isRecordFieldReadOnly: isRecordFieldReadOnly({
          isRecordReadOnly,
          isSystemObject: objectMetadataItem.isSystem,
          objectPermissions: getObjectPermissionsFromMapByObjectMetadataId({
            objectPermissionsByObjectMetadataId,
            objectMetadataId: objectMetadataItem.id,
          }),
          isFieldFromStandardApplication:
            getIsMetadataItemFromStandardApplication(fieldMetadataItem),
          fieldMetadataItem,
          fieldDefinition,
          objectPermissionsByObjectMetadataId,
        }),
        onMouseEnter,
        anchorId: `${getRecordFieldInputInstanceId({
          recordId,
          fieldName: fieldMetadataItem.name,
          prefix: instanceId,
        })}`,
        isForbidden: isJunctionRelationForbidden({
          fieldMetadataItem,
          sourceObjectMetadataId: objectMetadataItem.id,
          objectMetadataItems,
          objectPermissionsByObjectMetadataId,
        }),
      }}
    >
      <RecordFieldComponentInstanceContext.Provider
        value={{
          instanceId: getRecordFieldInputInstanceId({
            recordId,
            fieldName: fieldMetadataItem.name,
            prefix: instanceId,
          }),
        }}
      >
        <RecordInlineCell loading={recordLoading} />
      </RecordFieldComponentInstanceContext.Provider>
    </FieldContext.Provider>
  );
};
