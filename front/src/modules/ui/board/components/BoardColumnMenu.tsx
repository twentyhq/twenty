import { useRef, useState } from 'react';
import styled from '@emotion/styled';
import { IconPencil, IconPlus } from '@tabler/icons-react';

import { NewCompanyProgressButton } from '@/companies/components/NewCompanyProgressButton';
import { icon } from '@/ui//themes/icon';
import { DropdownMenu } from '@/ui/dropdown/components/DropdownMenu';
import { DropdownMenuItemsContainer } from '@/ui/dropdown/components/DropdownMenuItemsContainer';
import { DropdownMenuSelectableItem } from '@/ui/dropdown/components/DropdownMenuSelectableItem';
import DropdownButton from '@/ui/filter-n-sort/components/DropdownButton';
import { useListenClickOutsideArrayOfRef } from '@/ui/hooks/useListenClickOutsideArrayOfRef';
import { RecoilScope } from '@/ui/recoil-scope/components/RecoilScope';

import { BoardColumnEditTitleMenu } from './BoardColumnEditTitleMenu';

const StyledMenuContainer = styled.div`
  position: absolute;
  width: 200px;
  z-index: 1;
`;

type OwnProps = {
  onClose: () => void;
  title: string;
  color?: string;
  onTitleEdit: (title: string) => void;
  onColumnColorEdit: (color: string) => void;
};

export function BoardColumnMenu({
  onClose,
  onTitleEdit,
  onColumnColorEdit,
  title,
  color,
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
            <DropdownMenuSelectableItem
              onClick={() => setOpenMenu('opportunity')}
            >
              <DropdownButton.StyledIcon>
                <IconPlus size={icon.size.md} stroke={icon.stroke.sm} />
              </DropdownButton.StyledIcon>
              New opportunity
            </DropdownMenuSelectableItem>
          </DropdownMenuItemsContainer>
        )}
        {openMenu === 'title' && (
          <BoardColumnEditTitleMenu
            color={color}
            onClose={onClose}
            onTitleEdit={onTitleEdit}
            onColumnColorEdit={onColumnColorEdit}
            title={title}
          />
        )}
        {openMenu === 'opportunity' && (
          <RecoilScope>
            <NewCompanyProgressButton onStartCreateCard={true} />
          </RecoilScope>
        )}
      </DropdownMenu>
    </StyledMenuContainer>
  );
}
