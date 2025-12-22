import { useFieldMetadataItemById } from '@/object-metadata/hooks/useFieldMetadataItemById';
import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { formatFieldMetadataItemAsColumnDefinition } from '@/object-metadata/utils/formatFieldMetadataItemAsColumnDefinition';
import { useObjectPermissions } from '@/object-record/hooks/useObjectPermissions';
import { useIsRecordReadOnly } from '@/object-record/read-only/hooks/useIsRecordReadOnly';
import { isRecordFieldReadOnly } from '@/object-record/read-only/utils/isRecordFieldReadOnly';
import {
  FieldContext,
  type GenericFieldContextType,
} from '@/object-record/record-field/ui/contexts/FieldContext';
import { RecordFieldComponentInstanceContext } from '@/object-record/record-field/ui/states/contexts/RecordFieldComponentInstanceContext';
import { isFieldMorphRelation } from '@/object-record/record-field/ui/types/guards/isFieldMorphRelation';
import { isFieldRelation } from '@/object-record/record-field/ui/types/guards/isFieldRelation';
import { useRecordShowContainerActions } from '@/object-record/record-show/hooks/useRecordShowContainerActions';
import { getRecordFieldInputInstanceId } from '@/object-record/utils/getRecordFieldInputId';
import { useResolveFieldMetadataIdFromNameOrId } from '@/page-layout/hooks/useResolveFieldMetadataIdFromNameOrId';
import { FieldWidgetEditAction } from '@/page-layout/widgets/field/components/FieldWidgetEditAction';
import { FieldWidgetRelationEditAction } from '@/page-layout/widgets/field/components/FieldWidgetRelationEditAction';
import { isFieldWidget } from '@/page-layout/widgets/field/utils/isFieldWidget';
import { getObjectPermissionsFromMapByObjectMetadataId } from '@/settings/roles/role-permissions/objects-permissions/utils/getObjectPermissionsFromMapByObjectMetadataId';
import { useLayoutRenderingContext } from '@/ui/layout/contexts/LayoutRenderingContext';
import { useTargetRecord } from '@/ui/layout/contexts/useTargetRecord';
import { assertIsDefinedOrThrow } from 'twenty-shared/utils';
import { useCurrentWidget } from '../hooks/useCurrentWidget';

export const WidgetActionFieldEdit = () => {
  const widget = useCurrentWidget();
  const targetRecord = useTargetRecord();
  const { isInRightDrawer } = useLayoutRenderingContext();

  const { objectMetadataItem } = useObjectMetadataItem({
    objectNameSingular: targetRecord.targetObjectNameSingular,
  });

  const fieldMetadataId = isFieldWidget(widget)
    ? widget.configuration.fieldMetadataId
    : undefined;

  const resolvedFieldMetadataId = useResolveFieldMetadataIdFromNameOrId(
    fieldMetadataId ?? '',
  );

  const { fieldMetadataItem } = useFieldMetadataItemById(
    resolvedFieldMetadataId ?? '',
  );

  const { objectPermissionsByObjectMetadataId } = useObjectPermissions();

  const { useUpdateOneObjectRecordMutation } = useRecordShowContainerActions({
    objectNameSingular: objectMetadataItem.nameSingular,
    objectRecordId: targetRecord.id,
  });

  const isRecordReadOnly = useIsRecordReadOnly({
    recordId: targetRecord.id,
    objectMetadataId: objectMetadataItem.id,
  });

  assertIsDefinedOrThrow(fieldMetadataItem);

  const fieldDefinition = formatFieldMetadataItemAsColumnDefinition({
    field: fieldMetadataItem,
    position: 0,
    objectMetadataItem,
    showLabel: true,
    labelWidth: 90,
  });

  const isRelationField =
    isFieldRelation(fieldDefinition) || isFieldMorphRelation(fieldDefinition);

  if (isRelationField) {
    return (
      <FieldWidgetRelationEditAction
        fieldDefinition={fieldDefinition}
        recordId={targetRecord.id}
      />
    );
  }

  const instanceId = `field-widget-${targetRecord.id}-${fieldMetadataItem.name}-${isInRightDrawer ? 'right-drawer' : ''}`;

  const recordFieldInputInstanceId = getRecordFieldInputInstanceId({
    recordId: targetRecord.id,
    fieldName: fieldMetadataItem.name,
    prefix: instanceId,
  });

  const fieldContextValue = {
    recordId: targetRecord.id,
    maxWidth: 200,
    isLabelIdentifier: false,
    fieldDefinition,
    useUpdateRecord: useUpdateOneObjectRecordMutation,
    isDisplayModeFixHeight: false,
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
    anchorId: recordFieldInputInstanceId,
  } satisfies GenericFieldContextType;

  return (
    <RecordFieldComponentInstanceContext.Provider
      value={{
        instanceId: recordFieldInputInstanceId,
      }}
    >
      <FieldContext.Provider value={fieldContextValue}>
        <FieldWidgetEditAction />
      </FieldContext.Provider>
    </RecordFieldComponentInstanceContext.Provider>
  );
};
