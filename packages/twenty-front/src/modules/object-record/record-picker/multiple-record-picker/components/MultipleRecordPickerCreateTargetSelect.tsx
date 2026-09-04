import { ObjectMetadataIcon } from '@/object-metadata/components/ObjectMetadataIcon';
import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { DropdownMenuHeader } from '@/ui/layout/dropdown/components/DropdownMenuHeader/DropdownMenuHeader';
import { DropdownMenuHeaderLeftComponent } from '@/ui/layout/dropdown/components/DropdownMenuHeader/internal/DropdownMenuHeaderLeftComponent';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { DropdownMenuSeparator } from '@/ui/layout/dropdown/components/DropdownMenuSeparator';
import { SelectableList } from '@/ui/layout/selectable-list/components/SelectableList';
import { SelectableListItem } from '@/ui/layout/selectable-list/components/SelectableListItem';
import { selectedItemIdComponentState } from '@/ui/layout/selectable-list/states/selectedItemIdComponentState';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { t } from '@lingui/core/macro';
import { IconChevronLeft } from 'twenty-ui/icon';
import { MenuItem } from 'twenty-ui/navigation';

type MultipleRecordPickerCreateTargetSelectProps = {
  objectMetadataItems: EnrichedObjectMetadataItem[];
  selectableListInstanceId: string;
  focusId: string;
  disabled: boolean;
  onBack: () => void;
  onSelect: (objectMetadataItemId: string) => void;
};

export const MultipleRecordPickerCreateTargetSelect = ({
  objectMetadataItems,
  selectableListInstanceId,
  focusId,
  disabled,
  onBack,
  onSelect,
}: MultipleRecordPickerCreateTargetSelectProps) => {
  const selectedItemId = useAtomComponentStateValue(
    selectedItemIdComponentState,
    selectableListInstanceId,
  );

  const handleSelect = (objectMetadataItemId: string) => {
    if (!disabled) {
      onSelect(objectMetadataItemId);
    }
  };

  return (
    <>
      <DropdownMenuHeader
        StartComponent={
          <DropdownMenuHeaderLeftComponent
            Icon={IconChevronLeft}
            onClick={onBack}
          />
        }
      >
        {t`Select a record type`}
      </DropdownMenuHeader>
      <DropdownMenuSeparator />
      <DropdownMenuItemsContainer hasMaxHeight>
        <SelectableList
          selectableListInstanceId={selectableListInstanceId}
          selectableItemIdArray={objectMetadataItems.map(({ id }) => id)}
          focusId={focusId}
          shouldPreselectFirstItem
        >
          {objectMetadataItems.map((objectMetadataItem) => (
            <SelectableListItem
              key={objectMetadataItem.id}
              itemId={objectMetadataItem.id}
              onEnter={() => handleSelect(objectMetadataItem.id)}
            >
              <MenuItem
                LeftComponent={
                  <ObjectMetadataIcon objectMetadataItem={objectMetadataItem} />
                }
                text={objectMetadataItem.labelSingular}
                focused={selectedItemId === objectMetadataItem.id}
                disabled={disabled}
                onClick={() => handleSelect(objectMetadataItem.id)}
              />
            </SelectableListItem>
          ))}
        </SelectableList>
      </DropdownMenuItemsContainer>
    </>
  );
};
