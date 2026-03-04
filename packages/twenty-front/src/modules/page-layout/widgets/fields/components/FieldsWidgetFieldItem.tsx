import { ActivityTargetsInlineCell } from '@/activities/inline-cell/components/ActivityTargetsInlineCell';
import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { formatFieldMetadataItemAsColumnDefinition } from '@/object-metadata/utils/formatFieldMetadataItemAsColumnDefinition';
import { isRecordFieldReadOnly } from '@/object-record/read-only/utils/isRecordFieldReadOnly';
import { isActivityTargetField } from '@/object-record/record-field-list/utils/categorizeRelationFields';
import {
  FieldContext,
  type RecordUpdateHook,
} from '@/object-record/record-field/ui/contexts/FieldContext';
import { RecordFieldComponentInstanceContext } from '@/object-record/record-field/ui/states/contexts/RecordFieldComponentInstanceContext';
import { isJunctionRelationForbidden } from '@/object-record/record-field/ui/utils/junction/isJunctionRelationForbidden';
import { RecordInlineCell } from '@/object-record/record-inline-cell/components/RecordInlineCell';
import { getRecordFieldInputInstanceId } from '@/object-record/utils/getRecordFieldInputId';
import { getObjectPermissionsFromMapByObjectMetadataId } from '@/settings/roles/role-permissions/objects-permissions/utils/getObjectPermissionsFromMapByObjectMetadataId';
import {
  type CoreObjectNameSingular,
  type ObjectPermissions,
} from 'twenty-shared/types';

type FieldsWidgetFieldItemProps = {
  fieldMetadataItem: FieldMetadataItem;
  globalIndex: number;
  recordId: string;
  targetObjectNameSingular: string;
  objectMetadataItem: ObjectMetadataItem;
  objectMetadataItems: ObjectMetadataItem[];
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
  targetObjectNameSingular,
  objectMetadataItem,
  objectMetadataItems,
  objectPermissionsByObjectMetadataId,
  isRecordReadOnly,
  useUpdateRecord,
  recordLoading,
  instanceId,
  onMouseEnter,
}: FieldsWidgetFieldItemProps) => {
  const isActivityTarget = isActivityTargetField(
    fieldMetadataItem.name,
    targetObjectNameSingular,
  );

  return (
    <FieldContext.Provider
      key={recordId + fieldMetadataItem.id}
      value={{
        recordId,
        maxWidth: 200,
        isLabelIdentifier: false,
        fieldDefinition: formatFieldMetadataItemAsColumnDefinition({
          field: fieldMetadataItem,
          position: globalIndex,
          objectMetadataItem,
          showLabel: true,
          labelWidth: 90,
        }),
        useUpdateRecord,
        isDisplayModeFixHeight: true,
        isRecordFieldReadOnly: isRecordFieldReadOnly({
          isRecordReadOnly,
          objectPermissions: getObjectPermissionsFromMapByObjectMetadataId({
            objectPermissionsByObjectMetadataId,
            objectMetadataId: objectMetadataItem.id,
          }),
          fieldMetadataItem: {
            id: fieldMetadataItem.id,
            isUIReadOnly: fieldMetadataItem.isUIReadOnly ?? false,
          },
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
      {isActivityTarget ? (
        <ActivityTargetsInlineCell
          componentInstanceId={getRecordFieldInputInstanceId({
            recordId,
            fieldName: fieldMetadataItem.name,
            prefix: instanceId,
          })}
          activityObjectNameSingular={
            targetObjectNameSingular as
              | CoreObjectNameSingular.Note
              | CoreObjectNameSingular.Task
          }
          activityRecordId={recordId}
          showLabel={true}
          maxWidth={200}
        />
      ) : (
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
      )}
    </FieldContext.Provider>
  );
};
