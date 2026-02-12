import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { t } from '@lingui/core/macro';

import { useApplyObjectFilterDropdownFilterValue } from '@/object-record/object-filter-dropdown/hooks/useApplyObjectFilterDropdownFilterValue';
import { useObjectFilterDropdownFilterValue } from '@/object-record/object-filter-dropdown/hooks/useObjectFilterDropdownFilterValue';
import { BooleanDisplay } from '@/ui/field/display/components/BooleanDisplay';
import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { GenericDropdownContentWidth } from '@/ui/layout/dropdown/constants/GenericDropdownContentWidth';
import { useCloseDropdown } from '@/ui/layout/dropdown/hooks/useCloseDropdown';
import { SelectableList } from '@/ui/layout/selectable-list/components/SelectableList';
import { IconCheck } from 'twenty-ui/display';

const StyledBooleanSelectContainer = styled.div<{ selected?: boolean }>`
  align-items: center;
  cursor: pointer;
  display: flex;
  padding: ${({ theme }) =>
    `${theme.spacing(2)} ${theme.spacing(2)} ${theme.spacing(2)} ${theme.spacing(1)}`};
  border-radius: ${({ theme }) => theme.border.radius.sm};
  color: ${({ theme }) => theme.font.color.primary};
  &:hover {
    background: ${({ theme }) => theme.background.transparent.light};
  }
`;

const StyledIconCheckContainer = styled.div`
  flex: 1;
  display: flex;
  justify-content: flex-end;
`;

export const ObjectFilterDropdownBooleanSelect = () => {
  const theme = useTheme();
  const options = [true, false];

  const { objectFilterDropdownFilterValue } =
    useObjectFilterDropdownFilterValue();

  const { applyObjectFilterDropdownFilterValue } =
    useApplyObjectFilterDropdownFilterValue();

  const { closeDropdown } = useCloseDropdown();

  const handleOptionSelect = (newValue: boolean) => {
    applyObjectFilterDropdownFilterValue(
      newValue.toString(),
      newValue ? t`True` : t`False`,
    );

    closeDropdown();
  };

  return (
    <DropdownContent widthInPixels={GenericDropdownContentWidth.ExtraLarge}>
      <SelectableList
        selectableListInstanceId="boolean-select"
        selectableItemIdArray={options.map((option) => option.toString())}
        focusId="boolean-select"
      >
        <DropdownMenuItemsContainer hasMaxHeight>
          {options.map((option) => (
            <StyledBooleanSelectContainer
              key={String(option)}
              onClick={() => handleOptionSelect(option)}
              selected={objectFilterDropdownFilterValue === option.toString()}
            >
              <BooleanDisplay value={option} />
              {objectFilterDropdownFilterValue === option.toString() && (
                <StyledIconCheckContainer>
                  <IconCheck color={theme.grayScale.gray11} size={16} />
                </StyledIconCheckContainer>
              )}
            </StyledBooleanSelectContainer>
          ))}
        </DropdownMenuItemsContainer>
      </SelectableList>
    </DropdownContent>
  );
};
