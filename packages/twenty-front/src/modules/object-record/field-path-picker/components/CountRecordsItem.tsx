import { COUNT_RECORDS_ITEM_KEY } from '@/object-record/field-path-picker/constants/CountRecordsItemKey';
import { FIELD_PATH_PICKER_SELECTABLE_LIST_ID } from '@/object-record/field-path-picker/constants/FieldPathPickerSelectableListId';
import { useSelectableList } from '@/ui/layout/selectable-list/hooks/useSelectableList';
import { MenuItemLeftContent } from '@/ui/navigation/menu-item/internals/components/MenuItemLeftContent';
import { StyledMenuItemBase } from '@/ui/navigation/menu-item/internals/components/StyledMenuItemBase';
import { useRecoilValue } from 'recoil';
import { IconTallymarks } from 'twenty-ui';

interface CountRecordsItemProps {
  onSelect: () => void;
  objectLabelPlural?: string;
}

export const CountRecordsItem = (props: CountRecordsItemProps) => {
  const { isSelectedItemIdSelector } = useSelectableList(
    FIELD_PATH_PICKER_SELECTABLE_LIST_ID,
  );
  const isSelectedByKeyboard = useRecoilValue(
    isSelectedItemIdSelector(COUNT_RECORDS_ITEM_KEY),
  );

  return (
    <StyledMenuItemBase
      onClick={() => props.onSelect()}
      isKeySelected={isSelectedByKeyboard}
    >
      <MenuItemLeftContent
        LeftIcon={IconTallymarks}
        text={`Count ${props.objectLabelPlural?.toLowerCase() ?? 'records'}`}
      />
    </StyledMenuItemBase>
  );
};
