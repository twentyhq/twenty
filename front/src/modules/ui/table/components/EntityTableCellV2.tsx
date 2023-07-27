import { useContext } from 'react';
import { useSetRecoilState } from 'recoil';

import { GenericEditableCell } from '@/ui/table/components/GenericEditableCell';

import { RecoilScope } from '../../recoil-scope/components/RecoilScope';
import { useCurrentRowSelected } from '../hooks/useCurrentRowSelected';
import { ColumnIndexContext } from '../states/ColumnIndexContext';
import { contextMenuPositionState } from '../states/contextMenuPositionState';
import { EntityFieldMetadataContext } from '../states/EntityFieldMetadataContext';

export function EntityTableCell({ cellIndex }: { cellIndex: number }) {
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

  const entityFieldMetadata = useContext(EntityFieldMetadataContext);

  if (!entityFieldMetadata) {
    return null;
  }

  return (
    <RecoilScope>
      <ColumnIndexContext.Provider value={cellIndex}>
        <td
          onContextMenu={(event) => handleContextMenu(event)}
          style={{
            width: entityFieldMetadata.columnSize,
            minWidth: entityFieldMetadata.columnSize,
            maxWidth: entityFieldMetadata.columnSize,
          }}
        >
          <GenericEditableCell entityFieldMetadata={entityFieldMetadata} />
        </td>
      </ColumnIndexContext.Provider>
    </RecoilScope>
  );
}
