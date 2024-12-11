import styled from '@emotion/styled';
import { useCallback, useRef } from 'react';

import { useRecordGroupActions } from '@/object-record/record-group/hooks/useRecordGroupActions';
import { DropdownMenu } from '@/ui/layout/dropdown/components/DropdownMenu';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { useListenClickOutside } from '@/ui/utilities/pointer-event/hooks/useListenClickOutside';
import { MenuItem } from 'twenty-ui';

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

  const recordGroupActions = useRecordGroupActions();

  const closeMenu = useCallback(() => {
    onClose();
  }, [onClose]);

  useListenClickOutside({
    refs: [boardColumnMenuRef],
    callback: closeMenu,
    listenerId: 'record-board-column-dropdown-menu',
  });

  return (
    <StyledMenuContainer ref={boardColumnMenuRef}>
      <DropdownMenu data-select-disable>
        <DropdownMenuItemsContainer>
          {recordGroupActions.map((action) => (
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
