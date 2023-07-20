import React, { ChangeEvent } from 'react';
import styled from '@emotion/styled';
import { IconPencil, IconPlus, IconUser } from '@tabler/icons-react';

import { debounce } from '~/utils/debounce';

import { DropdownMenu } from '../../dropdown/components/DropdownMenu';
import { DropdownMenuItemsContainer } from '../../dropdown/components/DropdownMenuItemsContainer';
import { DropdownMenuSelectableItem } from '../../dropdown/components/DropdownMenuSelectableItem';
import DropdownButton from '../../filter-n-sort/components/DropdownButton';
import { icon } from '../../themes/icon';

const StyledMenuContainer = styled.div`
  position: absolute;
`;

type OwnProps = {
  onClose: () => void;
  title: string;
  onTitleEdit: (title: string) => void;
};

const COLOR_OPTIONS = [
  {
    name: 'Red',
    value: '#ff0000',
  },
  {
    name: 'Green',
    value: '#00ff00',
  },
  {
    name: 'Blue',
    value: '#0000ff',
  },
];

export function BoardColumnMenu({ onClose, onTitleEdit, title }: OwnProps) {
  return (
    <StyledMenuContainer>
      <DropdownMenu>
        <DropdownMenuItemsContainer>
          <DropdownMenuSelectableItem onClick={console.log}>
            <DropdownButton.StyledIcon>
              <IconPencil size={icon.size.md} stroke={icon.stroke.sm} />
            </DropdownButton.StyledIcon>
            Rename
          </DropdownMenuSelectableItem>
          <DropdownMenuSelectableItem onClick={console.log}>
            <DropdownButton.StyledIcon>
              <IconPlus size={icon.size.md} stroke={icon.stroke.sm} />
            </DropdownButton.StyledIcon>
            New opportunity
          </DropdownMenuSelectableItem>
        </DropdownMenuItemsContainer>
      </DropdownMenu>
    </StyledMenuContainer>
  );
}
