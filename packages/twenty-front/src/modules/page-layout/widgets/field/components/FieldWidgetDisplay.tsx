import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { useObjectPermissions } from '@/object-record/hooks/useObjectPermissions';
import { useIsRecordReadOnly } from '@/object-record/read-only/hooks/useIsRecordReadOnly';
import { isRecordFieldReadOnly } from '@/object-record/read-only/utils/isRecordFieldReadOnly';
import { FieldContext } from '@/object-record/record-field/ui/contexts/FieldContext';
import { RecordFieldComponentInstanceContext } from '@/object-record/record-field/ui/states/contexts/RecordFieldComponentInstanceContext';
import { type FieldDefinition } from '@/object-record/record-field/ui/types/FieldDefinition';
import { useRecordShowContainerActions } from '@/object-record/record-show/hooks/useRecordShowContainerActions';
import { getRecordFieldInputInstanceId } from '@/object-record/utils/getRecordFieldInputId';
import { FieldWidgetCellEditModePortal } from '@/page-layout/widgets/field/components/FieldWidgetCellEditModePortal';
import { FieldWidgetCellHoveredPortal } from '@/page-layout/widgets/field/components/FieldWidgetCellHoveredPortal';
import { FieldWidgetInlineCell } from '@/page-layout/widgets/field/components/FieldWidgetInlineCell';
import { getObjectPermissionsFromMapByObjectMetadataId } from '@/settings/roles/role-permissions/objects-permissions/utils/getObjectPermissionsFromMapByObjectMetadataId';
import { RightDrawerProvider } from '@/ui/layout/right-drawer/contexts/RightDrawerContext';
import styled from '@emotion/styled';
import { useState } from 'react';

const StyledContainer = styled.div`
  padding: ${({ theme }) => theme.spacing(1)};
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
  const [isHovered, setIsHovered] = useState(false);

  const instanceId = `field-widget-${recordId}-${fieldMetadataItem.name}-${isInRightDrawer ? 'right-drawer' : ''}`;

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
        <StyledContainer onMouseEnter={handleMouseEnter}>
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
              // onMouseEnter: handleMouseEnter,
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
  );
};
