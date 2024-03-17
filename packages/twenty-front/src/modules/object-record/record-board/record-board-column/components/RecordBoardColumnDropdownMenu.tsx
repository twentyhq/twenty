import { useCallback, useContext, useRef } from 'react';
import styled from '@emotion/styled';
import {
  DropdownMenu,
  DropdownMenuItemsContainer,
  MenuItem,
  useListenClickOutside,
} from 'twenty-ui';

import { RecordBoardColumnContext } from '@/object-record/record-board/record-board-column/contexts/RecordBoardColumnContext';

const StyledMenuContainer = styled.div`
  position: absolute;
  top: ${({ theme }) => theme.spacing(10)};
  width: 200px;
  z-index: 1;
`;

type RecordBoardColumnDropdownMenuProps = {
  onClose: () => void;
  onDelete?: (id: string) => void;
  stageId: string;
};

export const RecordBoardColumnDropdownMenu = ({
  onClose,
}: RecordBoardColumnDropdownMenuProps) => {
  const boardColumnMenuRef = useRef<HTMLDivElement>(null);

  const closeMenu = useCallback(() => {
    onClose();
  }, [onClose]);

  useListenClickOutside({
    refs: [boardColumnMenuRef],
    callback: closeMenu,
  });

  const { columnDefinition } = useContext(RecordBoardColumnContext);

  return (
    <StyledMenuContainer ref={boardColumnMenuRef}>
      <DropdownMenu data-select-disable>
        <DropdownMenuItemsContainer>
          {columnDefinition.actions.map((action) => (
            <MenuItem
              key={action.id}
              onClick={() => {
                action.callback();
                closeMenu();
              }}
              LeftIcon={action.icon}
              text={action.label}
            />
          ))}
        </DropdownMenuItemsContainer>
      </DropdownMenu>
    </StyledMenuContainer>
  );
};
