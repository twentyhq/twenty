import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { useObjectPermissions } from '@/object-record/hooks/useObjectPermissions';
import { useIsRecordReadOnly } from '@/object-record/read-only/hooks/useIsRecordReadOnly';
import { isRecordFieldReadOnly } from '@/object-record/read-only/utils/isRecordFieldReadOnly';
import { RecordFieldsScopeContextProvider } from '@/object-record/record-field-list/contexts/RecordFieldsScopeContext';
import { FieldContext } from '@/object-record/record-field/ui/contexts/FieldContext';
import { RecordFieldComponentInstanceContext } from '@/object-record/record-field/ui/states/contexts/RecordFieldComponentInstanceContext';
import { type FieldDefinition } from '@/object-record/record-field/ui/types/FieldDefinition';
import { useRecordShowContainerActions } from '@/object-record/record-show/hooks/useRecordShowContainerActions';
import { getRecordFieldInputInstanceId } from '@/object-record/utils/getRecordFieldInputId';
import { FieldWidgetCellEditModePortal } from '@/page-layout/widgets/field/components/FieldWidgetCellEditModePortal';
import { FieldWidgetCellHoveredPortal } from '@/page-layout/widgets/field/components/FieldWidgetCellHoveredPortal';
import { FieldWidgetInlineCell } from '@/page-layout/widgets/field/components/FieldWidgetInlineCell';
import { fieldWidgetHoverComponentState } from '@/page-layout/widgets/field/states/fieldWidgetHoverComponentState';
import { getFieldWidgetInstanceId } from '@/page-layout/widgets/field/utils/getFieldWidgetInstanceId';
import { useCurrentWidget } from '@/page-layout/widgets/hooks/useCurrentWidget';
import { getObjectPermissionsFromMapByObjectMetadataId } from '@/settings/roles/role-permissions/objects-permissions/utils/getObjectPermissionsFromMapByObjectMetadataId';
import { RightDrawerProvider } from '@/ui/layout/right-drawer/contexts/RightDrawerContext';
import { useRecoilComponentState } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentState';
import styled from '@emotion/styled';

const StyledContainer = styled.div`
  width: 100%;
`;

type FieldWidgetDisplayProps = {
  fieldDefinition: FieldDefinition<any>;
  fieldMetadataItem: FieldMetadataItem;
  objectMetadataItem: ObjectMetadataItem;
  recordId: string;
  isInRightDrawer: boolean;
};

export const FieldWidgetDisplay = ({
  fieldDefinition,
  fieldMetadataItem,
  objectMetadataItem,
  recordId,
  isInRightDrawer,
}: FieldWidgetDisplayProps) => {
  const widget = useCurrentWidget();

  const [isHovered, setIsHovered] = useRecoilComponentState(
    fieldWidgetHoverComponentState,
  );

  const instanceId = getFieldWidgetInstanceId({
    widgetId: widget.id,
    recordId,
    fieldName: fieldMetadataItem.name,
    isInRightDrawer,
  });

  const { objectPermissionsByObjectMetadataId } = useObjectPermissions();

  const { useUpdateOneObjectRecordMutation } = useRecordShowContainerActions({
    objectNameSingular: objectMetadataItem.nameSingular,
    objectRecordId: recordId,
  });

  const isRecordReadOnly = useIsRecordReadOnly({
    recordId,
    objectMetadataId: objectMetadataItem.id,
  });

  const handleMouseEnter = () => setIsHovered(true);
  const handleMouseLeave = () => setIsHovered(false);

  return (
    <RecordFieldsScopeContextProvider value={{ scopeInstanceId: instanceId }}>
      <RightDrawerProvider value={{ isInRightDrawer }}>
        <RecordFieldComponentInstanceContext.Provider
          value={{
            instanceId: getRecordFieldInputInstanceId({
              recordId,
              fieldName: fieldMetadataItem.name,
              prefix: instanceId,
            }),
          }}
        >
          <StyledContainer>
            <FieldContext.Provider
              value={{
                recordId,
                maxWidth: 200,
                isLabelIdentifier: false,
                fieldDefinition,
                useUpdateRecord: useUpdateOneObjectRecordMutation,
                isDisplayModeFixHeight: false,
                isRecordFieldReadOnly: isRecordFieldReadOnly({
                  isRecordReadOnly,
                  objectPermissions:
                    getObjectPermissionsFromMapByObjectMetadataId({
                      objectPermissionsByObjectMetadataId,
                      objectMetadataId: objectMetadataItem.id,
                    }),
                  fieldMetadataItem: {
                    id: fieldMetadataItem.id,
                    isUIReadOnly: fieldMetadataItem.isUIReadOnly ?? false,
                  },
                }),
                onMouseEnter: handleMouseEnter,
                anchorId: getRecordFieldInputInstanceId({
                  recordId,
                  fieldName: fieldMetadataItem.name,
                  prefix: instanceId,
                }),
              }}
            >
              <FieldWidgetInlineCell instanceIdPrefix={instanceId} />
            </FieldContext.Provider>
          </StyledContainer>

          <FieldWidgetCellHoveredPortal
            objectMetadataItem={objectMetadataItem}
            fieldMetadataItem={fieldMetadataItem}
            recordId={recordId}
            instanceId={instanceId}
            isHovered={isHovered}
            onMouseLeave={handleMouseLeave}
          />
          <FieldWidgetCellEditModePortal
            objectMetadataItem={objectMetadataItem}
            fieldMetadataItem={fieldMetadataItem}
            recordId={recordId}
            instanceId={instanceId}
          />
        </RecordFieldComponentInstanceContext.Provider>
      </RightDrawerProvider>
    </RecordFieldsScopeContextProvider>
  );
};
