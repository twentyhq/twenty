import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
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
import { generateFieldWidgetInstanceId } from '@/page-layout/widgets/field/utils/generateFieldWidgetInstanceId';
import { useCurrentWidget } from '@/page-layout/widgets/hooks/useCurrentWidget';
import { getObjectPermissionsFromMapByObjectMetadataId } from '@/settings/roles/role-permissions/objects-permissions/utils/getObjectPermissionsFromMapByObjectMetadataId';
import { SidePanelProvider } from '@/ui/layout/side-panel/contexts/SidePanelContext';
import { useAtomComponentState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentState';
import { styled } from '@linaria/react';

const StyledContainer = styled.div`
  width: 100%;
`;

type FieldWidgetDisplayProps = {
  fieldDefinition: FieldDefinition<any>;
  fieldMetadataItem: FieldMetadataItem;
  objectMetadataItem: EnrichedObjectMetadataItem;
  recordId: string;
  isInSidePanel: boolean;
};

export const FieldWidgetDisplay = ({
  fieldDefinition,
  fieldMetadataItem,
  objectMetadataItem,
  recordId,
  isInSidePanel,
}: FieldWidgetDisplayProps) => {
  const widget = useCurrentWidget();

  const [fieldWidgetHover, setFieldWidgetHover] = useAtomComponentState(
    fieldWidgetHoverComponentState,
  );

  const instanceId = generateFieldWidgetInstanceId({
    widgetId: widget.id,
    recordId,
    fieldName: fieldMetadataItem.name,
    isInSidePanel,
  });

  const { objectPermissionsByObjectMetadataId } = useObjectPermissions();

  const { useUpdateOneObjectRecordMutation } = useRecordShowContainerActions({
    objectNameSingular: objectMetadataItem.nameSingular,
  });

  const isRecordReadOnly = useIsRecordReadOnly({
    recordId,
    objectMetadataId: objectMetadataItem.id,
  });

  const handleMouseEnter = () => setFieldWidgetHover(true);
  const handleMouseLeave = () => setFieldWidgetHover(false);

  return (
    <RecordFieldsScopeContextProvider value={{ scopeInstanceId: instanceId }}>
      <SidePanelProvider value={{ isInSidePanel }}>
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
                  isSystemObject: objectMetadataItem.isSystem,
                  objectPermissions:
                    getObjectPermissionsFromMapByObjectMetadataId({
                      objectPermissionsByObjectMetadataId,
                      objectMetadataId: objectMetadataItem.id,
                    }),
                  fieldMetadataItem: {
                    id: fieldMetadataItem.id,
                    isUIReadOnly: fieldMetadataItem.isUIReadOnly ?? false,
                    isCustom: fieldMetadataItem.isCustom ?? false,
                  },
                  fieldDefinition,
                  objectPermissionsByObjectMetadataId,
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
            isHovered={fieldWidgetHover}
            onMouseLeave={handleMouseLeave}
          />
          <FieldWidgetCellEditModePortal
            objectMetadataItem={objectMetadataItem}
            fieldMetadataItem={fieldMetadataItem}
            recordId={recordId}
            instanceId={instanceId}
          />
        </RecordFieldComponentInstanceContext.Provider>
      </SidePanelProvider>
    </RecordFieldsScopeContextProvider>
  );
};
