import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { useRecordTableWidgetLayoutCallbacks } from '@/page-layout/widgets/record-table/hooks/useRecordTableWidgetLayoutCallbacks';
import { isFieldMetadataItemAvailableAsCalendarField } from '@/object-record/record-calendar/utils/isFieldMetadataItemAvailableAsCalendarField';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { DropdownComponentInstanceContext } from '@/ui/layout/dropdown/contexts/DropdownComponentInstanceContext';
import { useCloseDropdown } from '@/ui/layout/dropdown/hooks/useCloseDropdown';
import { SelectableList } from '@/ui/layout/selectable-list/components/SelectableList';
import { SelectableListItem } from '@/ui/layout/selectable-list/components/SelectableListItem';
import { selectedItemIdComponentState } from '@/ui/layout/selectable-list/states/selectedItemIdComponentState';
import { useAvailableComponentInstanceIdOrThrow } from '@/ui/utilities/state/component-state/hooks/useAvailableComponentInstanceIdOrThrow';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { useIcons } from 'twenty-ui/icon';
import { MenuItemSelect } from 'twenty-ui/navigation';

type RecordTableCalendarFieldDropdownContentProps = {
  pageLayoutId: string;
  widgetId: string;
  objectMetadataId: string;
  currentCalendarFieldMetadataId: string | null;
};

export const RecordTableCalendarFieldDropdownContent = ({
  pageLayoutId,
  widgetId,
  objectMetadataId,
  currentCalendarFieldMetadataId,
}: RecordTableCalendarFieldDropdownContentProps) => {
  const { getIcon } = useIcons();

  const { objectMetadataItems } = useObjectMetadataItems();
  const objectMetadataItem = objectMetadataItems.find(
    (objectMetadataItemToFind) =>
      objectMetadataItemToFind.id === objectMetadataId,
  );

  const dropdownId = useAvailableComponentInstanceIdOrThrow(
    DropdownComponentInstanceContext,
  );

  const selectedItemId = useAtomComponentStateValue(
    selectedItemIdComponentState,
    dropdownId,
  );

  const { closeDropdown } = useCloseDropdown();

  const { handleCalendarFieldChange } = useRecordTableWidgetLayoutCallbacks({
    pageLayoutId,
    widgetId,
  });

  const dateFields = (objectMetadataItem?.readableFields ?? []).filter(
    isFieldMetadataItemAvailableAsCalendarField,
  );

  return (
    <DropdownMenuItemsContainer hasMaxHeight>
      <SelectableList
        selectableListInstanceId={dropdownId}
        selectableItemIdArray={dateFields.map(
          (fieldMetadataItem) => fieldMetadataItem.id,
        )}
        focusId={dropdownId}
      >
        {dateFields.map((fieldMetadataItem) => (
          <SelectableListItem
            key={fieldMetadataItem.id}
            itemId={fieldMetadataItem.id}
            onEnter={() => {
              handleCalendarFieldChange(fieldMetadataItem);
              closeDropdown();
            }}
          >
            <MenuItemSelect
              text={fieldMetadataItem.label}
              LeftIcon={getIcon(fieldMetadataItem.icon)}
              selected={currentCalendarFieldMetadataId === fieldMetadataItem.id}
              focused={selectedItemId === fieldMetadataItem.id}
              onClick={() => {
                handleCalendarFieldChange(fieldMetadataItem);
                closeDropdown();
              }}
            />
          </SelectableListItem>
        ))}
      </SelectableList>
    </DropdownMenuItemsContainer>
  );
};
