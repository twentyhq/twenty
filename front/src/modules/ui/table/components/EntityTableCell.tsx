import { useContext } from 'react';
import styled from '@emotion/styled';
import { useSetRecoilState } from 'recoil';

import { contextMenuIsOpenState } from '@/ui/context-menu/states/contextMenuIsOpenState';
import { contextMenuPositionState } from '@/ui/context-menu/states/contextMenuPositionState';
import { RecoilScope } from '@/ui/utilities/recoil-scope/components/RecoilScope';

import { ColumnContext } from '../contexts/ColumnContext';
import { ColumnIndexContext } from '../contexts/ColumnIndexContext';
import { GenericEditableCell } from '../editable-cell/components/GenericEditableCell';
import { useCurrentRowSelected } from '../hooks/useCurrentRowSelected';

const StyledCell = styled.div`
  &:hover {
    background: ${({ theme }) => theme.background.secondary};
    border-radius: ${({ theme }) => theme.border.radius.sm};
    box-shadow: inset 0 0 0 1px ${({ theme }) => theme.border.color.strong};
  }
`;

export function EntityTableCell({ cellIndex }: { cellIndex: number }) {
  const setContextMenuPosition = useSetRecoilState(contextMenuPositionState);
  const setContextMenuOpenState = useSetRecoilState(contextMenuIsOpenState);

  const { setCurrentRowSelected } = useCurrentRowSelected();

  function handleContextMenu(event: React.MouseEvent) {
    event.preventDefault();
    setCurrentRowSelected(true);
    setContextMenuPosition({
      x: event.clientX,
      y: event.clientY,
    });
    setContextMenuOpenState(true);
  }

  const columnDefinition = useContext(ColumnContext);

  if (!columnDefinition) {
    return null;
  }

  return (
    <RecoilScope>
      <ColumnIndexContext.Provider value={cellIndex}>
        <td onContextMenu={(event) => handleContextMenu(event)}>
          <StyledCell>
            <GenericEditableCell columnDefinition={columnDefinition} />
          </StyledCell>
        </td>
      </ColumnIndexContext.Provider>
    </RecoilScope>
  );
}
