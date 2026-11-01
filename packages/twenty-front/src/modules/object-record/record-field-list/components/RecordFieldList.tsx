import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { FieldDescriptionTooltipProvider } from '@/object-record/record-field/ui/components/FieldDescriptionTooltipProvider';
import { formatFieldMetadataItemAsColumnDefinition } from '@/object-metadata/utils/formatFieldMetadataItemAsColumnDefinition';
import { useObjectPermissions } from '@/object-record/hooks/useObjectPermissions';
import { useIsRecordReadOnly } from '@/object-record/read-only/hooks/useIsRecordReadOnly';
import { isRecordFieldReadOnly } from '@/object-record/read-only/utils/isRecordFieldReadOnly';
import { useRecordRestrictedFieldNames } from '@/object-record/record-store/hooks/useRecordRestrictedFieldNames';
import { RecordFieldListCellEditModePortal } from '@/object-record/record-field-list/anchored-portal/components/RecordFieldListCellEditModePortal';
import { RecordFieldListCellHoveredPortal } from '@/object-record/record-field-list/anchored-portal/components/RecordFieldListCellHoveredPortal';
import { useRecordFieldListNonRelationFieldMetadataItems } from '@/object-record/record-field-list/hooks/useRecordFieldListNonRelationFieldMetadataItems';
import { RecordFieldListComponentInstanceContext } from '@/object-record/record-field-list/states/contexts/RecordFieldListComponentInstanceContext';
import { recordFieldListHoverPositionComponentState } from '@/object-record/record-field-list/states/recordFieldListHoverPositionComponentState';
import { FieldContext } from '@/object-record/record-field/ui/contexts/FieldContext';
import { RecordFieldComponentInstanceContext } from '@/object-record/record-field/ui/states/contexts/RecordFieldComponentInstanceContext';
import { RecordInlineCell } from '@/object-record/record-inline-cell/components/RecordInlineCell';
import { PropertyBox } from '@/object-record/record-inline-cell/property-box/components/PropertyBox';
import { useRecordShowContainerActions } from '@/object-record/record-show/hooks/useRecordShowContainerActions';
import { useRecordShowContainerData } from '@/object-record/record-show/hooks/useRecordShowContainerData';
import { getRecordFieldInputInstanceId } from '@/object-record/utils/getRecordFieldInputId';
import { useSetAtomComponentState } from '@/ui/utilities/state/jotai/hooks/useSetAtomComponentState';

type RecordFieldListProps = {
  instanceId: string;
  objectNameSingular: string;
  objectRecordId: string;
};

export const RecordFieldList = ({
  instanceId,
  objectNameSingular,
  objectRecordId,
}: RecordFieldListProps) => {
  const { recordLoading } = useRecordShowContainerData({
    objectRecordId,
  });

  const { objectMetadataItem } = useObjectMetadataItem({
    objectNameSingular,
  });

  const { objectPermissionsByObjectMetadataId } = useObjectPermissions();

  const { useUpdateOneObjectRecordMutation } = useRecordShowContainerActions({
    objectNameSingular,
  });

  const isRecordReadOnly = useIsRecordReadOnly({
    recordId: objectRecordId,
    objectMetadataId: objectMetadataItem.id,
  });

  const setRecordFieldListHoverPosition = useSetAtomComponentState(
    recordFieldListHoverPositionComponentState,
    instanceId,
  );

  const handleMouseEnter = (index: number) => {
    setRecordFieldListHoverPosition(index);
  };

  const fieldMetadataItems =
    useRecordFieldListNonRelationFieldMetadataItems(objectNameSingular);

  const restrictedFieldNames = useRecordRestrictedFieldNames(objectRecordId);

  return (
    <FieldDescriptionTooltipProvider>
      <RecordFieldListComponentInstanceContext.Provider
        value={{
          instanceId,
        }}
      >
        <PropertyBox dataTestId="record-fields-list-container">
          {fieldMetadataItems.map((fieldMetadataItem, index) => {
            const fieldDefinition = formatFieldMetadataItemAsColumnDefinition({
              field: fieldMetadataItem,
              position: index,
              objectMetadataItem,
              showLabel: true,
              labelWidth: 90,
            });

            const isFieldRestricted = restrictedFieldNames.includes(
              fieldMetadataItem.name,
            );

            return (
              <FieldContext.Provider
                key={objectRecordId + fieldMetadataItem.id}
                value={{
                  recordId: objectRecordId,
                  maxWidth: 200,
                  isLabelIdentifier: false,
                  fieldDefinition,
                  useUpdateRecord: useUpdateOneObjectRecordMutation,
                  isDisplayModeFixHeight: true,
                  isForbidden: isFieldRestricted,
                  isRecordFieldReadOnly:
                    isFieldRestricted ||
                    isRecordFieldReadOnly({
                      isRecordReadOnly,
                      objectMetadataId: objectMetadataItem.id,
                      fieldMetadataItem,
                      fieldDefinition,
                      objectPermissionsByObjectMetadataId,
                    }),
                  onMouseEnter: () => handleMouseEnter(index),
                  anchorId: `${getRecordFieldInputInstanceId({
                    recordId: objectRecordId,
                    fieldName: fieldMetadataItem.name,
                    prefix: instanceId,
                  })}`,
                }}
              >
                <RecordFieldComponentInstanceContext.Provider
                  value={{
                    instanceId: getRecordFieldInputInstanceId({
                      recordId: objectRecordId,
                      fieldName: fieldMetadataItem.name,
                      prefix: instanceId,
                    }),
                  }}
                >
                  <RecordInlineCell
                    loading={recordLoading}
                    instanceIdPrefix={instanceId}
                  />
                </RecordFieldComponentInstanceContext.Provider>
              </FieldContext.Provider>
            );
          })}
        </PropertyBox>
        <RecordFieldListCellHoveredPortal
          objectMetadataItem={objectMetadataItem}
          recordId={objectRecordId}
        />
        <RecordFieldListCellEditModePortal
          objectMetadataItem={objectMetadataItem}
          recordId={objectRecordId}
        />
      </RecordFieldListComponentInstanceContext.Provider>
    </FieldDescriptionTooltipProvider>
  );
};
