import { PointerEvent, useCallback, useMemo, useState } from 'react';
import styled from '@emotion/styled';

import type {
  ViewFieldDefinition,
  ViewFieldMetadata,
} from '../types/ViewField';

import { ColumnHead } from './ColumnHead';
import { SelectAllCheckbox } from './SelectAllCheckbox';

const COLUMN_MIN_WIDTH = 75;

const StyledColumnHeaderCell = styled.th<{ isResizing?: boolean }>`
  min-width: ${COLUMN_MIN_WIDTH}px;
  position: relative;
  user-select: none;
  ${({ isResizing, theme }) => {
    if (isResizing) {
      return `&:after {
        background-color: ${theme.color.blue};
        bottom: 0;
        content: '';
        display: block;
        position: absolute;
        right: -1px;
        top: 0;
        width: 2px;
      }`;
    }
  }};
`;

const StyledResizeHandler = styled.div`
  bottom: 0;
  cursor: col-resize;
  padding: 0 ${({ theme }) => theme.spacing(2)};
  position: absolute;
  right: -9px;
  top: 0;
  width: 3px;
  z-index: 1;
`;

type OwnProps = {
  onColumnResize: (resizedFieldId: string, width: number) => void;
  viewFields: ViewFieldDefinition<ViewFieldMetadata>[];
};

export function EntityTableHeader({ onColumnResize, viewFields }: OwnProps) {
  const columnWidths = useMemo(
    () =>
      viewFields.reduce<Record<string, number>>(
        (result, viewField) => ({
          ...result,
          [viewField.id]: viewField.columnSize,
        }),
        {},
      ),
    [viewFields],
  );
  const [isResizing, setIsResizing] = useState(false);
  const [initialPointerPositionX, setInitialPointerPositionX] = useState<
    number | null
  >(null);

  const [resizedFieldId, setResizedFieldId] = useState<string | null>(null);
  const [offset, setOffset] = useState(0);

  const handleResizeHandlerDragStart = useCallback(
    (event: PointerEvent<HTMLDivElement>, fieldId: string) => {
      setIsResizing(true);
      setResizedFieldId(fieldId);
      setInitialPointerPositionX(event.clientX);
    },
    [setIsResizing, setResizedFieldId, setInitialPointerPositionX],
  );

  const handleResizeHandlerDrag = useCallback(
    (event: PointerEvent<HTMLDivElement>) => {
      if (!isResizing || initialPointerPositionX === null) return;

      setOffset(event.clientX - initialPointerPositionX);
    },
    [isResizing, initialPointerPositionX],
  );

  const handleResizeHandlerDragEnd = useCallback(() => {
    setIsResizing(false);
    if (!resizedFieldId) return;

    const nextWidth = Math.round(
      Math.max(columnWidths[resizedFieldId] + offset, COLUMN_MIN_WIDTH),
    );

    if (nextWidth !== columnWidths[resizedFieldId]) {
      onColumnResize(resizedFieldId, nextWidth);
    }

    setOffset(0);
  }, [resizedFieldId, columnWidths, offset, onColumnResize]);

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

        {viewFields.map((viewField) => (
          <StyledColumnHeaderCell
            key={viewField.columnOrder.toString()}
            isResizing={isResizing && resizedFieldId === viewField.id}
            style={{
              width: Math.max(
                columnWidths[viewField.id] +
                  (resizedFieldId === viewField.id ? offset : 0),
                COLUMN_MIN_WIDTH,
              ),
            }}
          >
            <ColumnHead
              viewName={viewField.columnLabel}
              viewIcon={viewField.columnIcon}
            />
            <StyledResizeHandler
              className="cursor-col-resize"
              role="separator"
              onPointerDown={(event) =>
                handleResizeHandlerDragStart(event, viewField.id)
              }
              onPointerMove={handleResizeHandlerDrag}
              onPointerOut={handleResizeHandlerDragEnd}
              onPointerUp={handleResizeHandlerDragEnd}
            />
          </StyledColumnHeaderCell>
        ))}
        <th></th>
      </tr>
    </thead>
  );
}
