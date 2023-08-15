import { ChangeEvent, useState } from 'react';
import styled from '@emotion/styled';

import { DropdownMenuItemsContainer } from '@/ui/dropdown/components/DropdownMenuItemsContainer';
import { DropdownMenuSelectableItem } from '@/ui/dropdown/components/DropdownMenuSelectableItem';
import { DropdownMenuSeparator } from '@/ui/dropdown/components/DropdownMenuSeparator';
import { textInputStyle } from '@/ui/theme/constants/effects';
import { debounce } from '~/utils/debounce';

export const StyledEditTitleContainer = styled.div`
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

type OwnProps = {
  onClose: () => void;
  title: string;
  onTitleEdit: (title: string, color: string) => void;
  color: string;
};

const StyledColorSample = styled.div<{ colorName: string }>`
  background-color: ${({ theme, colorName }) =>
    theme.tag.background[colorName]};
  border: 1px solid
    ${({ theme, colorName }) =>
      theme.color[colorName as keyof typeof theme.color]};
  border-radius: ${({ theme }) => theme.border.radius.sm};
  height: 12px;
  width: 12px;
`;

export const COLOR_OPTIONS = [
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
}: OwnProps) {
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
    <DropdownMenuItemsContainer>
      <StyledEditTitleContainer>
        <StyledEditModeInput
          value={internalValue}
          onChange={handleChange}
          autoComplete="off"
          autoFocus
        />
      </StyledEditTitleContainer>
      <DropdownMenuSeparator />
      {COLOR_OPTIONS.map((colorOption) => (
        <DropdownMenuSelectableItem
          key={colorOption.name}
          onClick={() => {
            onTitleEdit(title, colorOption.id);
            onClose();
          }}
          selected={colorOption.id === color}
        >
          <StyledColorSample colorName={colorOption.id} />
          {colorOption.name}
        </DropdownMenuSelectableItem>
      ))}
    </DropdownMenuItemsContainer>
  );
}
