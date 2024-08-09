import { FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { FIELD_PATH_PICKER_SELECTABLE_LIST_ID } from '@/object-record/field-path-picker/constants/FieldPathPickerSelectableListId';
import { useSelectableList } from '@/ui/layout/selectable-list/hooks/useSelectableList';
import { MenuItemLeftContent } from '@/ui/navigation/menu-item/internals/components/MenuItemLeftContent';
import { StyledMenuItemBase } from '@/ui/navigation/menu-item/internals/components/StyledMenuItemBase';
import { useRecoilValue } from 'recoil';
import { useIcons } from 'twenty-ui';

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

  const { getIcon } = useIcons();
  const IconComponent = getIcon(props.fieldMetadata.icon);

  return (
    <StyledMenuItemBase
      onClick={() => props.onSelect(props.fieldMetadata.id)}
      isKeySelected={isSelectedByKeyboard}
    >
      <MenuItemLeftContent
        LeftIcon={IconComponent}
        text={props.fieldMetadata.label}
      />
    </StyledMenuItemBase>
  );
};
