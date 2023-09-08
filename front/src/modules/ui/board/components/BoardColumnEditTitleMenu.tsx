import { ChangeEvent, useState } from 'react';
import styled from '@emotion/styled';

import { StyledDropdownMenuItemsContainer } from '@/ui/dropdown/components/StyledDropdownMenuItemsContainer';
import { StyledDropdownMenuSeparator } from '@/ui/dropdown/components/StyledDropdownMenuSeparator';
import { MenuItemSelectColor } from '@/ui/menu-item/components/MenuItemSelectColor';
import { ThemeColor } from '@/ui/theme/constants/colors';
import { textInputStyle } from '@/ui/theme/constants/effects';
import { debounce } from '~/utils/debounce';

const StyledEditTitleContainer = styled.div`
  --vertical-padding: ${({ theme }) => theme.spacing(1)};

  align-items: center;

  display: flex;
  flex-direction: row;
  height: calc(36px - 2 * var(--vertical-padding));
  padding: var(--vertical-padding) 0;

  width: calc(100%);
`;

const StyledEditModeInput = styled.input`
  font-size: ${({ theme }) => theme.font.size.sm};

  ${textInputStyle}

  width: 100%;
`;

export type BoardColumnEditTitleMenuProps = {
  onClose: () => void;
  title: string;
  onTitleEdit: (title: string, color: string) => void;
  color: ThemeColor;
};

type ColumnColorOption = {
  name: string;
  id: ThemeColor;
};

export const COLUMN_COLOR_OPTIONS: ColumnColorOption[] = [
  { name: 'Green', id: 'green' },
  { name: 'Turquoise', id: 'turquoise' },
  { name: 'Sky', id: 'sky' },
  { name: 'Blue', id: 'blue' },
  { name: 'Purple', id: 'purple' },
  { name: 'Pink', id: 'pink' },
  { name: 'Red', id: 'red' },
  { name: 'Orange', id: 'orange' },
  { name: 'Yellow', id: 'yellow' },
  { name: 'Gray', id: 'gray' },
];

export function BoardColumnEditTitleMenu({
  onClose,
  onTitleEdit,
  title,
  color,
}: BoardColumnEditTitleMenuProps) {
  const [internalValue, setInternalValue] = useState(title);
  const debouncedOnUpdateTitle = debounce(
    (newTitle) => onTitleEdit(newTitle, color),
    200,
  );
  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    setInternalValue(event.target.value);
    debouncedOnUpdateTitle(event.target.value);
  };
  return (
    <StyledDropdownMenuItemsContainer>
      <StyledEditTitleContainer>
        <StyledEditModeInput
          value={internalValue}
          onChange={handleChange}
          autoComplete="off"
          autoFocus
        />
      </StyledEditTitleContainer>
      <StyledDropdownMenuSeparator />
      {COLUMN_COLOR_OPTIONS.map((colorOption) => (
        <MenuItemSelectColor
          key={colorOption.name}
          onClick={() => {
            onTitleEdit(title, colorOption.id);
            onClose();
          }}
          color={colorOption.id}
          selected={colorOption.id === color}
          text={colorOption.name}
        />
      ))}
    </StyledDropdownMenuItemsContainer>
  );
}
