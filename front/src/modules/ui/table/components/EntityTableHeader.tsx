import { DragEvent, useCallback, useRef, useState } from 'react';
import styled from '@emotion/styled';

import { TableColumn } from '@/people/table/components/peopleColumns';

import { ColumnHead } from './ColumnHead';
import { SelectAllCheckbox } from './SelectAllCheckbox';

const COLUMN_MIN_WIDTH = 75;

const StyledColumnHeaderCell = styled.th<{ isResizing?: boolean }>`
  min-width: ${COLUMN_MIN_WIDTH}px;
  position: relative;

  ${(props) =>
    props.isResizing
      ? `&:after {
          background-color: ${props.theme.color.blue};
          bottom: 0;
          content: '';
          display: block;
          position: absolute;
          right: -1.5px;
          top: 0;
          width: 2px;
        }`
      : ''}
`;

const StyledResizeHandler = styled.div`
  bottom: 0;
  cursor: col-resize;
  padding: 0 ${({ theme }) => theme.spacing(2)};
  position: absolute;
  right: -9px;
  top: 0;
  width: 1px;
  z-index: 1;
`;

export function EntityTableHeader({
  columns,
}: {
  columns: Array<TableColumn>;
}) {
  const [columnWidths, setColumnWidths] = useState(
    columns.reduce<Record<string, number>>(
      (result, column) => ({ ...result, [column.id]: column.size }),
      {},
    ),
  );
  const [offset, setOffset] = useState(0);
  const resizedColumnId = useRef('');
  const initialHandlerPosition = useRef(-1);

  const handleResizeHandlerDragStart = useCallback(
    (event: DragEvent<HTMLDivElement>, columnId: string) => {
      resizedColumnId.current = columnId;
      initialHandlerPosition.current = event.clientX;
    },
    [],
  );

  const handleResizeHandlerDrag = useCallback(
    (event: DragEvent<HTMLDivElement>) => {
      // @see https://stackoverflow.com/q/36308460
      // `event.screenX === 0` allows to detect the last "drag" event
      // which is emitted on mouse release.
      // On this last "drag" event, `event.clientX` is reset to an incorrect value
      // which does not reflect the handler's position, so we ignore it.
      if (event.screenX === 0) return;

      setOffset(event.clientX - initialHandlerPosition.current);
    },
    [],
  );

  const handleResizeHandlerDragEnd = useCallback(() => {
    setColumnWidths((previousColumnWidths) => ({
      ...previousColumnWidths,
      [resizedColumnId.current]: Math.max(
        previousColumnWidths[resizedColumnId.current] + offset,
        COLUMN_MIN_WIDTH,
      ),
    }));
    resizedColumnId.current = '';
  }, [offset]);

  return (
    <thead>
      <tr>
        <th
          style={{
            width: 30,
            minWidth: 30,
            maxWidth: 30,
          }}
        >
          <SelectAllCheckbox />
        </th>
        {columns.map((column) => (
          <StyledColumnHeaderCell
            key={column.id.toString()}
            isResizing={resizedColumnId.current === column.id}
            style={{
              width: Math.max(
                columnWidths[column.id] +
                  (resizedColumnId.current === column.id ? offset : 0),
                COLUMN_MIN_WIDTH,
              ),
            }}
          >
            <ColumnHead viewName={column.title} viewIcon={column.icon} />
            <StyledResizeHandler
              draggable
              role="separator"
              onDragStart={(event) =>
                handleResizeHandlerDragStart(event, column.id)
              }
              onDrag={handleResizeHandlerDrag}
              onDragEnd={handleResizeHandlerDragEnd}
            />
          </StyledColumnHeaderCell>
        ))}
        <th></th>
      </tr>
    </thead>
  );
}
