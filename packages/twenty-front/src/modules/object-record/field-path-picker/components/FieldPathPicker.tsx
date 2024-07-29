import { useFilteredObjectMetadataItems } from '@/object-metadata/hooks/useFilteredObjectMetadataItems';
import { FieldSelectItem } from '@/object-record/field-path-picker/components/FieldSelectItem';
import { FIELD_PATH_PICKER_SELECTABLE_LIST_ID } from '@/object-record/field-path-picker/constants/FieldPathPickerSelectableListId';
import { getViewFieldMetadataItems } from '@/object-record/field-path-picker/utils/getViewFieldMetadataItems';
import { FieldDefinition } from '@/object-record/record-field/types/FieldDefinition';
import { FieldFieldPathDraftValue } from '@/object-record/record-field/types/FieldInputDraftValue';
import {
  FieldFieldPathValue,
  FieldMetadata,
} from '@/object-record/record-field/types/FieldMetadata';
import { DropdownMenu } from '@/ui/layout/dropdown/components/DropdownMenu';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { DropdownMenuSearchInput } from '@/ui/layout/dropdown/components/DropdownMenuSearchInput';
import { DropdownMenuSeparator } from '@/ui/layout/dropdown/components/DropdownMenuSeparator';
import { SelectableList } from '@/ui/layout/selectable-list/components/SelectableList';
import { MenuItem } from '@/ui/navigation/menu-item/components/MenuItem';
import styled from '@emotion/styled';
import { SetterOrUpdater } from 'recoil';

const StyledContainer = styled.div`
  background: ${({ theme }) => theme.background.primary};
`;

interface FieldPathPickerProps {
  draftValue?: FieldFieldPathValue | undefined;
  setDraftValue: SetterOrUpdater<FieldFieldPathDraftValue | undefined>;
  fieldDefinition: FieldDefinition<FieldMetadata>;
  fieldValue: FieldFieldPathValue;
  setFieldValue: SetterOrUpdater<FieldFieldPathValue>;
  hotkeyScope: string;
  sourceObjectNameSingular?: string;
  onClickOutside: any;
}

export const FieldPathPicker = (props: FieldPathPickerProps) => {
  const { objectMetadataItems } = useFilteredObjectMetadataItems();

  const noResult = false;

  const onSearchQueryChange = (e: any) => {};
  const onFieldSelected = (fieldMetadataId: string) => {
    props.setDraftValue([fieldMetadataId]);
  };

  const sourceObjectMetadata = objectMetadataItems.find(
    (objectMetadata) =>
      objectMetadata.nameSingular === props.sourceObjectNameSingular,
  );

  if (!sourceObjectMetadata) return <div>No source object selected</div>;

  const selectableFieldMetadataItems = getViewFieldMetadataItems(
    objectMetadataItems,
    sourceObjectMetadata,
    props.draftValue,
  );

  const selectableItemIds = selectableFieldMetadataItems?.map(
    (fieldMetadata) => fieldMetadata.id as string,
  );

  return (
    <DropdownMenu data-select-disable>
      <DropdownMenuSearchInput onChange={onSearchQueryChange} autoFocus />
      <DropdownMenuSeparator />
      <DropdownMenuItemsContainer hasMaxHeight>
        <SelectableList
          selectableListId={FIELD_PATH_PICKER_SELECTABLE_LIST_ID}
          selectableItemIdArray={selectableItemIds}
          hotkeyScope={props.hotkeyScope}
        >
          {noResult ? (
            <MenuItem text="No result" />
          ) : (
            selectableFieldMetadataItems?.map((fieldMetadata) => (
              <FieldSelectItem
                key={fieldMetadata.id}
                fieldMetadata={fieldMetadata}
                onSelect={onFieldSelected}
              />
            ))
          )}
        </SelectableList>
      </DropdownMenuItemsContainer>
    </DropdownMenu>
  );
};
