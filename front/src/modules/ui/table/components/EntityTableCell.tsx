import { useContext } from 'react';
import { useSetRecoilState } from 'recoil';

import { contextMenuOpenState } from '@/ui/context-menu/states/ContextMenuIsOpenState';
import { RecoilScope } from '@/ui/utilities/recoil-scope/components/RecoilScope';

import { contextMenuPositionState } from '../../context-menu/states/ContextMenuPositionState';
import { GenericEditableCell } from '../editable-cell/components/GenericEditableCell';
import { useCurrentRowSelected } from '../hooks/useCurrentRowSelected';
import { ColumnIndexContext } from '../states/ColumnIndexContext';
import { ViewFieldContext } from '../states/ViewFieldContext';

export function EntityTableCell({ cellIndex }: { cellIndex: number }) {
  const setContextMenuPosition = useSetRecoilState(contextMenuPositionState);
  const setContextMenuOpenState = useSetRecoilState(contextMenuOpenState);

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
