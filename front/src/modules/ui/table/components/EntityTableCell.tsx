import { useContext } from 'react';
import { useSetRecoilState } from 'recoil';

import { contextMenuIsOpenState } from '@/ui/context-menu/states/contextMenuIsOpenState';
import { contextMenuPositionState } from '@/ui/context-menu/states/contextMenuPositionState';
import { RecoilScope } from '@/ui/utilities/recoil-scope/components/RecoilScope';

import { ColumnIndexContext } from '../contexts/ColumnIndexContext';
import { ViewFieldContext } from '../contexts/ViewFieldContext';
import { GenericEditableCell } from '../editable-cell/components/GenericEditableCell';
import { useCurrentRowSelected } from '../hooks/useCurrentRowSelected';

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

  const viewField = useContext(ViewFieldContext);

  if (!viewField) {
    return null;
  }

  return (
    <RecoilScope>
      <ColumnIndexContext.Provider value={cellIndex}>
        <td onContextMenu={(event) => handleContextMenu(event)}>
          <GenericEditableCell viewField={viewField} />
        </td>
      </ColumnIndexContext.Provider>
    </RecoilScope>
  );
}
