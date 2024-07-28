import { FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { FIELD_PATH_PICKER_SELECTABLE_LIST_ID } from '@/object-record/field-path-picker/constants/FieldPathPickerSelectableListId';
import { SelectableItem } from '@/ui/layout/selectable-list/components/SelectableItem';
import { useSelectableList } from '@/ui/layout/selectable-list/hooks/useSelectableList';
import { useRecoilValue } from 'recoil';

interface FieldSelectItemProps {
  fieldMetadata: FieldMetadataItem;
  onSelect: (fieldMetadataId: string) => void;
}

export const FieldSelectItem = (props: FieldSelectItemProps) => {
  const { isSelectedItemIdSelector } = useSelectableList(
    FIELD_PATH_PICKER_SELECTABLE_LIST_ID,
  );
  const isSelectedByKeyboard = useRecoilValue(
    isSelectedItemIdSelector(props.fieldMetadata.id),
  );

  return (
    <SelectableItem
      key={props.fieldMetadata.id}
      itemId={props.fieldMetadata.id}
    >
      <div onClick={() => props.onSelect(props.fieldMetadata.id)}>
        {props.fieldMetadata.label}
      </div>
    </SelectableItem>
  );
};
