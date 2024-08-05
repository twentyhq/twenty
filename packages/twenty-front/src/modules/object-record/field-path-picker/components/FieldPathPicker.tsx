import { useFilteredObjectMetadataItems } from '@/object-metadata/hooks/useFilteredObjectMetadataItems';
import { CountRecordsItem } from '@/object-record/field-path-picker/components/CountRecordsItem';
import { FieldSelectItem } from '@/object-record/field-path-picker/components/FieldSelectItem';
import { COUNT_RECORDS_ITEM_KEY } from '@/object-record/field-path-picker/constants/CountRecordsItemKey';
import { FIELD_PATH_PICKER_SELECTABLE_LIST_ID } from '@/object-record/field-path-picker/constants/FieldPathPickerSelectableListId';
import { getViewFieldMetadataItems } from '@/object-record/field-path-picker/utils/getViewFieldMetadataItems';
import { useRegisterInputEvents } from '@/object-record/record-field/meta-types/input/hooks/useRegisterInputEvents';
import { FieldFieldPathValue } from '@/object-record/record-field/types/FieldMetadata';
import { DropdownMenu } from '@/ui/layout/dropdown/components/DropdownMenu';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { DropdownMenuSearchInput } from '@/ui/layout/dropdown/components/DropdownMenuSearchInput';
import { DropdownMenuSeparator } from '@/ui/layout/dropdown/components/DropdownMenuSeparator';
import { SelectableList } from '@/ui/layout/selectable-list/components/SelectableList';
import { MenuItem } from '@/ui/navigation/menu-item/components/MenuItem';
import { useRef } from 'react';

interface FieldPathPickerProps {
  value?: FieldFieldPathValue | undefined;
  hotkeyScope: string;
  sourceObjectNameSingular?: string;
  onClickOutside: (
    event: MouseEvent | TouchEvent,
    newFieldPath: string[],
  ) => void;
  onEnter: (newFieldPath: string[]) => void;
  onEscape: (newFieldPath: string[]) => void;
  onTab?: (newFieldPath: string[]) => void;
  onShiftTab?: (newFieldPath: string[]) => void;
  onChange: (newFieldPath: string[]) => void;
}

export const FieldPathPicker = (props: FieldPathPickerProps) => {
  const { objectMetadataItems } = useFilteredObjectMetadataItems();

  const wrapperRef = useRef<HTMLDivElement>(null);

  useRegisterInputEvents({
    inputRef: wrapperRef,
    onClickOutside: props.onClickOutside,
    onEnter: props.onEnter,
    onEscape: props.onEscape,
    onTab: props.onTab,
    onShiftTab: props.onShiftTab,
    hotkeyScope: props.hotkeyScope,
    inputValue: props.value ?? [],
  });

  const noResult = false;

  const onSearchQueryChange = (e: any) => {};

  const sourceObjectMetadata = objectMetadataItems.find(
    (objectMetadata) =>
      objectMetadata.nameSingular === props.sourceObjectNameSingular,
  );

  if (!sourceObjectMetadata) return <div>No source object selected</div>;

  const selectableFieldMetadataItems = getViewFieldMetadataItems(
    objectMetadataItems,
    sourceObjectMetadata,
    props.value,
  );

  const selectableItemIds = [
    COUNT_RECORDS_ITEM_KEY,
    ...selectableFieldMetadataItems.map(
      (fieldMetadata) => fieldMetadata.id as string,
    ),
  ];

  return (
    <div ref={wrapperRef}>
      <DropdownMenu data-select-disable>
        <DropdownMenuSearchInput onChange={onSearchQueryChange} autoFocus />
        <DropdownMenuSeparator />
        <DropdownMenuItemsContainer hasMaxHeight>
          <SelectableList
            selectableListId={FIELD_PATH_PICKER_SELECTABLE_LIST_ID}
            selectableItemIdArray={selectableItemIds}
            hotkeyScope={props.hotkeyScope}
          >
            <CountRecordsItem
              key={COUNT_RECORDS_ITEM_KEY}
              onSelect={() => {
                // TODO: Close without calling props.onClickOutside that takes event as first parameter
              }}
            />
            <DropdownMenuSeparator />
            {noResult ? (
              <MenuItem text="No result" />
            ) : (
              selectableFieldMetadataItems?.map((fieldMetadata) => (
                <FieldSelectItem
                  key={fieldMetadata.id}
                  fieldMetadata={fieldMetadata}
                  onSelect={() =>
                    props.onChange([...(props.value ?? []), fieldMetadata.id])
                  }
                />
              ))
            )}
          </SelectableList>
        </DropdownMenuItemsContainer>
      </DropdownMenu>
    </div>
  );
};
