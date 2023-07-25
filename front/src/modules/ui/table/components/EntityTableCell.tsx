import { useSetRecoilState } from 'recoil';

import { RecoilScope } from '../../recoil-scope/components/RecoilScope';
import { useCurrentRowSelected } from '../hooks/useCurrentRowSelected';
import { ColumnIndexContext } from '../states/ColumnIndexContext';
import { contextMenuPositionState } from '../states/contextMenuPositionState';

export function EntityTableCell({
  cellIndex,
  children,
  size,
}: {
  size: number;
  cellIndex: number;
  children: React.ReactNode;
}) {
  const setContextMenuPosition = useSetRecoilState(contextMenuPositionState);

  const { setCurrentRowSelected } = useCurrentRowSelected();

  function handleContextMenu(event: React.MouseEvent) {
    event.preventDefault();

    setCurrentRowSelected(true);

    setContextMenuPosition({
      x: event.clientX,
      y: event.clientY,
    });
  }

  return (
    <RecoilScope>
      <ColumnIndexContext.Provider value={cellIndex}>
        <td
          onContextMenu={(event) => handleContextMenu(event)}
          style={{
            width: size,
            minWidth: size,
            maxWidth: size,
          }}
        >
          {children}
        </td>
      </ColumnIndexContext.Provider>
    </RecoilScope>
  );
}
