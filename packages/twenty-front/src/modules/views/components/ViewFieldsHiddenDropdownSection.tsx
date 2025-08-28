import { useActiveFieldMetadataItems } from '@/object-metadata/hooks/useActiveFieldMetadataItems';
import { useObjectOptionsForBoard } from '@/object-record/object-options-dropdown/hooks/useObjectOptionsForBoard';
import { ObjectOptionsDropdownContext } from '@/object-record/object-options-dropdown/states/contexts/ObjectOptionsDropdownContext';
import { useChangeRecordFieldVisibility } from '@/object-record/record-field/hooks/useChangeRecordFieldVisibility';
import { currentRecordFieldsComponentState } from '@/object-record/record-field/states/currentRecordFieldsComponentState';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';
import { ViewType } from '@/views/types/ViewType';
import { useContext } from 'react';
import { IconEye, useIcons } from 'twenty-ui/display';
import { MenuItem } from 'twenty-ui/navigation';

export const ViewFieldsHiddenDropdownSection = () => {
  const { viewType, objectMetadataItem, recordIndexId } = useContext(
    ObjectOptionsDropdownContext,
  );

  const { changeRecordFieldVisibility } =
    useChangeRecordFieldVisibility(recordIndexId);

  const { handleBoardFieldVisibilityChange } = useObjectOptionsForBoard({
    objectNameSingular: objectMetadataItem.nameSingular,
    recordBoardId: recordIndexId,
    viewBarId: recordIndexId,
  });

  const handleChangeFieldVisibility =
    viewType === ViewType.Kanban
      ? handleBoardFieldVisibilityChange
      : changeRecordFieldVisibility;

  const currentRecordFields = useRecoilComponentValue(
    currentRecordFieldsComponentState,
  );

  const visibleRecordFields = currentRecordFields.filter(
    (recordFieldToFilter) => recordFieldToFilter.isVisible === true,
  );

  const { activeFieldMetadataItems } = useActiveFieldMetadataItems({
    objectMetadataItem,
  });

  const availableFieldMetadataItemsToShow = activeFieldMetadataItems.filter(
    (fieldMetadataItemToFilter) =>
      !visibleRecordFields
        .map((recordField) => recordField.fieldMetadataItemId)
        .includes(fieldMetadataItemToFilter.id),
  );

  const { getIcon } = useIcons();

  return (
    <>
      <DropdownMenuItemsContainer>
        {availableFieldMetadataItemsToShow.length > 0 &&
          availableFieldMetadataItemsToShow.map((fieldMetadataItem) => {
            return (
              <MenuItem
                key={fieldMetadataItem.id}
                LeftIcon={getIcon(fieldMetadataItem.icon)}
                iconButtons={[
                  {
                    Icon: IconEye,
                    onClick: () =>
                      handleChangeFieldVisibility({
                        fieldMetadataId: fieldMetadataItem.id,
                        isVisible: true,
                      }),
                  },
                ]}
                text={fieldMetadataItem.label}
              />
            );
          })}
      </DropdownMenuItemsContainer>
    </>
  );
};
