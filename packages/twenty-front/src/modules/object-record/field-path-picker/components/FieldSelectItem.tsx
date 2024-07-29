import { FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { FIELD_PATH_PICKER_SELECTABLE_LIST_ID } from '@/object-record/field-path-picker/constants/FieldPathPickerSelectableListId';
import { SelectableItem } from '@/ui/layout/selectable-list/components/SelectableItem';
import { useSelectableList } from '@/ui/layout/selectable-list/hooks/useSelectableList';
import {
    StyledMenuItemBase,
    StyledMenuItemLabel,
    StyledMenuItemLeftContent,
} from '@/ui/navigation/menu-item/internals/components/StyledMenuItemBase';
import styled from '@emotion/styled';
import { useRecoilValue } from 'recoil';
import { OverflowingTextWithTooltip } from 'twenty-ui';

const StyledLeftContentWithCheckboxContainer = styled.div`
  align-items: center;
  display: flex;
  flex-direction: row;
  gap: ${({ theme }) => theme.spacing(2)};
  width: 100%;
`;

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
      <StyledMenuItemBase
        onClick={() => props.onSelect(props.fieldMetadata.id)}
        isKeySelected={isSelectedByKeyboard}
      >
        <StyledLeftContentWithCheckboxContainer>
          <StyledMenuItemLeftContent>
            <StyledMenuItemLabel hasLeftIcon>
              <OverflowingTextWithTooltip text={props.fieldMetadata.label} />
            </StyledMenuItemLabel>
          </StyledMenuItemLeftContent>
        </StyledLeftContentWithCheckboxContainer>
      </StyledMenuItemBase>
    </SelectableItem>
  );
};
