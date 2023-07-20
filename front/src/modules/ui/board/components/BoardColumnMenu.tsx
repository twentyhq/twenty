import { useRef, useState } from 'react';
import styled from '@emotion/styled';
import { IconPencil } from '@tabler/icons-react';

import { DropdownMenu } from '../../dropdown/components/DropdownMenu';
import { DropdownMenuItemsContainer } from '../../dropdown/components/DropdownMenuItemsContainer';
import { DropdownMenuSelectableItem } from '../../dropdown/components/DropdownMenuSelectableItem';
import DropdownButton from '../../filter-n-sort/components/DropdownButton';
import { useListenClickOutsideArrayOfRef } from '../../hooks/useListenClickOutsideArrayOfRef';
import { icon } from '../../themes/icon';

import { BoardColumnEditTitleMenu } from './BoardColumnEditTitleMenu';

const StyledMenuContainer = styled.div`
  position: absolute;
  z-index: 1;
`;

type OwnProps = {
  onClose: () => void;
  title: string;
  onTitleEdit: (title: string) => void;
  onColumnColorEdit: (color: string) => void;
};

export function BoardColumnMenu({
  onClose,
  onTitleEdit,
  onColumnColorEdit,
  title,
}: OwnProps) {
  const [openMenu, setOpenMenu] = useState('actions');
  const boardColumnMenuRef = useRef(null);

  useListenClickOutsideArrayOfRef({
    refs: [boardColumnMenuRef],
    callback: onClose,
  });

  return (
    <StyledMenuContainer ref={boardColumnMenuRef}>
      <DropdownMenu>
        {openMenu === 'actions' && (
          <DropdownMenuItemsContainer>
            <DropdownMenuSelectableItem onClick={() => setOpenMenu('title')}>
              <DropdownButton.StyledIcon>
                <IconPencil size={icon.size.md} stroke={icon.stroke.sm} />
              </DropdownButton.StyledIcon>
              Rename
            </DropdownMenuSelectableItem>
            {/* TODO: handle card creation from menu */}
            {/*             
            <DropdownMenuSelectableItem
              onClick={() => {
                return;
              }}
            >
              <DropdownButton.StyledIcon>
                <IconPlus size={icon.size.md} stroke={icon.stroke.sm} />
              </DropdownButton.StyledIcon>
              New opportunity
            </DropdownMenuSelectableItem> */}
          </DropdownMenuItemsContainer>
        )}
        {openMenu === 'title' && (
          <BoardColumnEditTitleMenu
            onClose={onClose}
            onTitleEdit={onTitleEdit}
            onColumnColorEdit={onColumnColorEdit}
            title={title}
          />
        )}
      </DropdownMenu>
    </StyledMenuContainer>
  );
}
