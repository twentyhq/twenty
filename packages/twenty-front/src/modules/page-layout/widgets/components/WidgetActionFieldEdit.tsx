import { useGetIsMetadataItemFromStandardApplication } from '@/object-metadata/hooks/useGetIsMetadataItemFromStandardApplication';
import { useObjectPermissions } from '@/object-record/hooks/useObjectPermissions';
import { useIsRecordReadOnly } from '@/object-record/read-only/hooks/useIsRecordReadOnly';
import { isRecordFieldReadOnly } from '@/object-record/read-only/utils/isRecordFieldReadOnly';
import { RecordFieldsScopeContextProvider } from '@/object-record/record-field-list/contexts/RecordFieldsScopeContext';
import {
  FieldContext,
  type GenericFieldContextType,
} from '@/object-record/record-field/ui/contexts/FieldContext';
import { RecordFieldComponentInstanceContext } from '@/object-record/record-field/ui/states/contexts/RecordFieldComponentInstanceContext';
import { isFieldInputOnly } from '@/object-record/record-field/ui/types/guards/isFieldInputOnly';
import { isFieldMorphRelation } from '@/object-record/record-field/ui/types/guards/isFieldMorphRelation';
import { isFieldRelation } from '@/object-record/record-field/ui/types/guards/isFieldRelation';
import { useRecordShowContainerActions } from '@/object-record/record-show/hooks/useRecordShowContainerActions';
import { getRecordFieldInputInstanceId } from '@/object-record/utils/getRecordFieldInputId';
import { type PageLayoutWidget } from '@/page-layout/types/PageLayoutWidget';
import { FieldWidgetEditAction } from '@/page-layout/widgets/field/components/FieldWidgetEditAction';
import { FieldWidgetRelationEditAction } from '@/page-layout/widgets/field/components/FieldWidgetRelationEditAction';
import { useFieldWidgetFieldDefinition } from '@/page-layout/widgets/field/hooks/useFieldWidgetFieldDefinition';
import { generateFieldWidgetInstanceId } from '@/page-layout/widgets/field/utils/generateFieldWidgetInstanceId';
import { getObjectPermissionsFromMapByObjectMetadataId } from '@/settings/roles/role-permissions/objects-permissions/utils/getObjectPermissionsFromMapByObjectMetadataId';
import { useLayoutRenderingContext } from '@/ui/layout/contexts/LayoutRenderingContext';
import { useTargetRecord } from '@/ui/layout/contexts/useTargetRecord';
import { assertIsDefinedOrThrow } from 'twenty-shared/utils';

type WidgetActionFieldEditProps = {
  widget: PageLayoutWidget;
};

export const WidgetActionFieldEdit = ({
  widget,
}: WidgetActionFieldEditProps) => {
  const targetRecord = useTargetRecord();
  const { isInSidePanel } = useLayoutRenderingContext();

  const { objectMetadataItem, fieldMetadataItem, fieldDefinition } =
    useFieldWidgetFieldDefinition(widget);

  const { objectPermissionsByObjectMetadataId } = useObjectPermissions();
  const getIsMetadataItemFromStandardApplication =
    useGetIsMetadataItemFromStandardApplication();

  const { useUpdateOneObjectRecordMutation } = useRecordShowContainerActions({
    objectNameSingular: objectMetadataItem.nameSingular,
  });

  const isRecordReadOnly = useIsRecordReadOnly({
    recordId: targetRecord.id,
    objectMetadataId: objectMetadataItem.id,
  });

  assertIsDefinedOrThrow(fieldMetadataItem);
  assertIsDefinedOrThrow(fieldDefinition);

  const isRelationField =
    isFieldRelation(fieldDefinition) || isFieldMorphRelation(fieldDefinition);

  const instanceId = generateFieldWidgetInstanceId({
    widgetId: widget.id,
    recordId: targetRecord.id,
    fieldName: fieldMetadataItem.name,
    isInSidePanel,
  });

  if (isRelationField) {
    return (
      <RecordFieldsScopeContextProvider value={{ scopeInstanceId: instanceId }}>
        <FieldWidgetRelationEditAction
          fieldDefinition={fieldDefinition}
          recordId={targetRecord.id}
        />
      </RecordFieldsScopeContextProvider>
    );
  }

  if (isFieldInputOnly(fieldDefinition)) {
    return null;
  }

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
      isSystemObject: objectMetadataItem.isSystem,
      objectPermissions: getObjectPermissionsFromMapByObjectMetadataId({
        objectPermissionsByObjectMetadataId,
        objectMetadataId: objectMetadataItem.id,
      }),
      isFieldFromStandardApplication:
        getIsMetadataItemFromStandardApplication(fieldMetadataItem),
      fieldMetadataItem: {
        id: fieldMetadataItem.id,
        isUIEditable: fieldMetadataItem.isUIEditable ?? true,
      },
      fieldDefinition,
      objectPermissionsByObjectMetadataId,
    }),
    anchorId: recordFieldInputInstanceId,
  } satisfies GenericFieldContextType;

  return (
    <RecordFieldsScopeContextProvider value={{ scopeInstanceId: instanceId }}>
      <RecordFieldComponentInstanceContext.Provider
        value={{
          instanceId: recordFieldInputInstanceId,
        }}
      >
        <FieldContext.Provider value={fieldContextValue}>
          <FieldWidgetEditAction />
        </FieldContext.Provider>
      </RecordFieldComponentInstanceContext.Provider>
    </RecordFieldsScopeContextProvider>
  );
};
