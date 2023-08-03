import { useCallback, useMemo, useState } from 'react';
import styled from '@emotion/styled';
import {
  useRecoilCallback,
  useRecoilState,
  useRecoilValue,
  useSetRecoilState,
} from 'recoil';

import { useTrackPointer } from '@/ui/utilities/pointer-event/hooks/useTrackPointer';
import { useUpdateViewFieldMutation } from '~/generated/graphql';

import { resizeFieldOffsetState } from '../states/resizeFieldOffsetState';
import { viewFieldsState } from '../states/viewFieldsState';

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

export function EntityTableHeader() {
  const viewFields = useRecoilValue(viewFieldsState);
  const setViewFields = useSetRecoilState(viewFieldsState);

  const [updateViewFieldMutation] = useUpdateViewFieldMutation();
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
  const [initialPointerPositionX, setInitialPointerPositionX] = useState<
    number | null
  >(null);

  const [resizedFieldId, setResizedFieldId] = useState<string | null>(null);
  const [offset, setOffset] = useRecoilState(resizeFieldOffsetState);

  const handleColumnResize = useCallback(
    (resizedFieldId: string, width: number) => {
      setViewFields((previousViewFields) =>
        previousViewFields.map((viewField) =>
          viewField.id === resizedFieldId
            ? { ...viewField, columnSize: width }
            : viewField,
        ),
      );
      updateViewFieldMutation({
        variables: {
          data: { sizeInPx: width },
          where: { id: resizedFieldId },
        },
      });
    },
    [setViewFields, updateViewFieldMutation],
  );

  const handleResizeHandlerStart = useCallback(
    (positionX: number, _: number) => {
      setInitialPointerPositionX(positionX);
    },
    [],
  );

  const handleResizeHandlerMove = useCallback(
    (positionX: number, _positionY: number) => {
      if (!initialPointerPositionX) return;
      setOffset(positionX - initialPointerPositionX);
    },
    [setOffset, initialPointerPositionX],
  );

  const handleResizeHandlerEnd = useRecoilCallback(
    ({ snapshot, set }) =>
      (_positionX: number, _positionY: number) => {
        if (!resizedFieldId) return;
        const nextWidth = Math.round(
          Math.max(
            columnWidths[resizedFieldId] +
              snapshot.getLoadable(resizeFieldOffsetState).valueOrThrow(),
            COLUMN_MIN_WIDTH,
          ),
        );

        if (nextWidth !== columnWidths[resizedFieldId]) {
          handleColumnResize(resizedFieldId, nextWidth);
        }
        set(resizeFieldOffsetState, 0);
        setInitialPointerPositionX(null);
        setResizedFieldId(null);
      },
    [resizedFieldId, columnWidths, setResizedFieldId, handleColumnResize],
  );

  useTrackPointer({
    shouldTrackPointer: resizedFieldId !== null,
    onMouseDown: handleResizeHandlerStart,
    onMouseMove: handleResizeHandlerMove,
    onMouseUp: handleResizeHandlerEnd,
  });

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
            isResizing={resizedFieldId === viewField.id}
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
              onPointerDown={() => {
                setResizedFieldId(viewField.id);
              }}
            />
          </StyledColumnHeaderCell>
        ))}
        <th></th>
      </tr>
    </thead>
  );
}
