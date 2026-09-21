import { SelectOptionIcon } from '@/ui/input/components/SelectOptionIcon';
import { OverflowingTextWithTooltip } from 'twenty-ui/primitives/surfaces';
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
import { ListItem } from 'twenty-ui/primitives/navigation';

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
            <ListItem
              focused={selectedItemId === fieldMetadataItem.id}
              onClick={() => {
                handleCalendarFieldChange(fieldMetadataItem);
                closeDropdown();
              }}
              role="option"
              aria-selected={
                currentCalendarFieldMetadataId === fieldMetadataItem.id
              }
              selected={currentCalendarFieldMetadataId === fieldMetadataItem.id}
              indicator="check"
              startIcon={
                <SelectOptionIcon Icon={getIcon(fieldMetadataItem.icon)} />
              }
            >
              <OverflowingTextWithTooltip text={fieldMetadataItem.label} />
            </ListItem>
          </SelectableListItem>
        ))}
      </SelectableList>
    </DropdownMenuItemsContainer>
  );
};
