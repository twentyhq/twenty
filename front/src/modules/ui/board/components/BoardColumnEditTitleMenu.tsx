import { ChangeEvent, useState } from 'react';
import styled from '@emotion/styled';

import { debounce } from '../../../../utils/debounce';
import { DropdownMenuItemsContainer } from '../../dropdown/components/DropdownMenuItemsContainer';
import { DropdownMenuSelectableItem } from '../../dropdown/components/DropdownMenuSelectableItem';
import { DropdownMenuSeparator } from '../../dropdown/components/DropdownMenuSeparator';
import { textInputStyle } from '../../themes/effects';

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
  onTitleEdit: (title: string) => void;
  onColumnColorEdit: (color: string) => void;
};

const StyledColorSample = styled.div<{ colorName: string }>`
  background-color: ${({ theme, colorName }) =>
    theme.tag.background[colorName]};
  border: 1px solid ${({ theme, colorName }) => theme.color[colorName]};
  border-radius: ${({ theme }) => theme.border.radius.sm};
  height: 12px;
  width: 12px;
`;

const COLOR_OPTIONS = [
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
  onColumnColorEdit,
  title,
}: OwnProps) {
  const [internalValue, setInternalValue] = useState(title);
  const debouncedOnUpdate = debounce(onTitleEdit, 200);
  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    setInternalValue(event.target.value);
    debouncedOnUpdate(event.target.value);
  };
  return (
    <DropdownMenuItemsContainer>
      <StyledEditTitleContainer>
        <StyledEditModeInput
          value={internalValue}
          onChange={handleChange}
          autoFocus
        />
      </StyledEditTitleContainer>
      <DropdownMenuSeparator />
      {COLOR_OPTIONS.map((color) => (
        <DropdownMenuSelectableItem
          key={color.name}
          onClick={() => {
            onColumnColorEdit(color.id);
            onClose();
          }}
        >
          <StyledColorSample colorName={color.id} />
          {color.name}
        </DropdownMenuSelectableItem>
      ))}
    </DropdownMenuItemsContainer>
  );
}
