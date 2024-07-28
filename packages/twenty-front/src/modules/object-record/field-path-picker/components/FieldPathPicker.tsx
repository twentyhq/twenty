import { useFilteredObjectMetadataItems } from '@/object-metadata/hooks/useFilteredObjectMetadataItems';
import { FieldDefinition } from '@/object-record/record-field/types/FieldDefinition';
import { FieldFieldPathDraftValue } from '@/object-record/record-field/types/FieldInputDraftValue';
import {
  FieldFieldPathValue,
  FieldMetadata,
} from '@/object-record/record-field/types/FieldMetadata';
import { RelationPickerHotkeyScope } from '@/object-record/relation-picker/types/RelationPickerHotkeyScope';
import { DropdownMenuSkeletonItem } from '@/ui/input/relation-picker/components/skeletons/DropdownMenuSkeletonItem';
import { DropdownMenuSearchInput } from '@/ui/layout/dropdown/components/DropdownMenuSearchInput';
import { DropdownMenuSeparator } from '@/ui/layout/dropdown/components/DropdownMenuSeparator';
import { SelectableItem } from '@/ui/layout/selectable-list/components/SelectableItem';
import { SelectableList } from '@/ui/layout/selectable-list/components/SelectableList';
import { MenuItem } from '@/ui/navigation/menu-item/components/MenuItem';
import { SetterOrUpdater } from 'recoil';

interface FieldPathPickerProps {
  draftValue?: FieldFieldPathValue | undefined;
  setDraftValue?: SetterOrUpdater<FieldFieldPathDraftValue | undefined>;
  fieldDefinition: FieldDefinition<FieldMetadata>;
  fieldValue: FieldFieldPathValue;
  setFieldValue: SetterOrUpdater<FieldFieldPathValue>;
}

export const FieldPathPicker = (props: FieldPathPickerProps) => {
  const { objectMetadataItems } = useFilteredObjectMetadataItems();
  console.log('objectMetadataItems', objectMetadataItems);

  const allFieldMetadataItems = objectMetadataItems.flatMap(
    (objectMetadata) => objectMetadata.fields,
  );

  const loading = true;
  const noResult = false;

  const selectableItemIds: any[] = [];
  const onSearchQueryChange = (e: any) => {};
  const onFieldSelected = (e: any) => {};

  const sourceObjectMetadata = objectMetadataItems.find(
    (objectMetadata) => objectMetadata.nameSingular === 'chart',
  );

  const selectableFieldMetadataItems = props.draftValue?.reduce(
    (acc, fieldPathFieldMetadataId) => {
      const fieldPathFieldMetadata = allFieldMetadataItems.find(
        (fieldMetadata) => fieldMetadata.id === fieldPathFieldMetadataId,
      );
      if (!fieldPathFieldMetadata) throw new Error();
      const { relationDefinition } = fieldPathFieldMetadata;
      if (!relationDefinition) throw new Error();

      const nextObjectMetadataId =
        relationDefinition.sourceFieldMetadata.id === fieldPathFieldMetadataId
          ? relationDefinition.targetObjectMetadata.id
          : relationDefinition.sourceObjectMetadata.id;
      const nextObjectMetadata = objectMetadataItems.find(
        (objectMetadata) => objectMetadata.id === nextObjectMetadataId,
      );
      if (!nextObjectMetadata) throw new Error();

      return nextObjectMetadata.fields;
    },
    sourceObjectMetadata?.fields,
  );

  return (
    <div>
      <DropdownMenuSearchInput onChange={onSearchQueryChange} autoFocus />
      <DropdownMenuSeparator />
      <SelectableList
        selectableListId="field-path-pick-list"
        selectableItemIdArray={selectableItemIds}
        hotkeyScope={RelationPickerHotkeyScope.RelationPicker}
        onEnter={(itemId: any) => {}}
      >
        {selectableFieldMetadataItems?.map((fieldMetadata) =>
          loading ? (
            <DropdownMenuSkeletonItem />
          ) : noResult ? (
            <MenuItem text="No result" />
          ) : (
            <SelectableItem itemId={fieldMetadata.id}>
              {fieldMetadata.label}
            </SelectableItem>
          ),
        )}
      </SelectableList>
    </div>
  );
};
