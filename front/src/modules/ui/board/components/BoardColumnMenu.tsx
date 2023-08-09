import { useRef, useState } from 'react';
import styled from '@emotion/styled';
import { IconPencil } from '@tabler/icons-react';
import { Key } from 'ts-key-enum';

import { DropdownMenu } from '@/ui/dropdown/components/DropdownMenu';
import { DropdownMenuItemsContainer } from '@/ui/dropdown/components/DropdownMenuItemsContainer';
import { DropdownMenuSelectableItem } from '@/ui/dropdown/components/DropdownMenuSelectableItem';
import { icon } from '@/ui/theme/constants/icon';
import { useScopedHotkeys } from '@/ui/utilities/hotkey/hooks/useScopedHotkeys';
import { useListenClickOutside } from '@/ui/utilities/pointer-event/hooks/useListenClickOutside';

import { BoardColumnHotkeyScope } from '../types/BoardColumnHotkeyScope';

import { BoardColumnEditTitleMenu } from './BoardColumnEditTitleMenu';

const StyledMenuContainer = styled.div`
  position: absolute;
  width: 200px;
  z-index: 1;
`;

type OwnProps = {
  onClose: () => void;
  title: string;
  color: string;
  onTitleEdit: (title: string, color: string) => void;
};

export function BoardColumnMenu({
  onClose,
  onTitleEdit,
  title,
  color,
}: OwnProps) {
  const [openMenu, setOpenMenu] = useState('actions');
  const boardColumnMenuRef = useRef(null);

  useListenClickOutside({
    refs: [boardColumnMenuRef],
    callback: onClose,
  });

  useScopedHotkeys(
    [Key.Escape, Key.Enter],
    onClose,
    BoardColumnHotkeyScope.BoardColumn,
    [],
  );

  return (
    <StyledMenuContainer ref={boardColumnMenuRef}>
      <DropdownMenu>
        {openMenu === 'actions' && (
          <DropdownMenuItemsContainer>
            <DropdownMenuSelectableItem onClick={() => setOpenMenu('title')}>
              <IconPencil size={icon.size.md} stroke={icon.stroke.sm} />
              Rename
            </DropdownMenuSelectableItem>
          </DropdownMenuItemsContainer>
        )}
        {openMenu === 'title' && (
          <BoardColumnEditTitleMenu
            color={color}
            onClose={onClose}
            onTitleEdit={onTitleEdit}
            title={title}
          />
        )}
      </DropdownMenu>
    </StyledMenuContainer>
  );
}
