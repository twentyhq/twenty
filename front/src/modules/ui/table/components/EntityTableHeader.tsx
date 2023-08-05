import { useCallback, useState } from 'react';
import { getOperationName } from '@apollo/client/utilities';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { useRecoilCallback, useRecoilState, useRecoilValue } from 'recoil';

import { IconButton } from '@/ui/button/components/IconButton';
import { IconPlus } from '@/ui/icon';
import { useTrackPointer } from '@/ui/utilities/pointer-event/hooks/useTrackPointer';
import { GET_VIEW_FIELDS } from '@/views/queries/select';
import {
  useCreateViewFieldMutation,
  useUpdateViewFieldMutation,
} from '~/generated/graphql';

import { toViewFieldInput } from '../hooks/useLoadView';
import { resizeFieldOffsetState } from '../states/resizeFieldOffsetState';
import {
  addableViewFieldDefinitionsState,
  columnWidthByViewFieldIdState,
  viewFieldsState,
  visibleViewFieldsState,
} from '../states/viewFieldsState';
import type {
  ViewFieldDefinition,
  ViewFieldMetadata,
} from '../types/ViewField';

import { ColumnHead } from './ColumnHead';
import { EntityTableColumnMenu } from './EntityTableColumnMenu';
import { SelectAllCheckbox } from './SelectAllCheckbox';

const COLUMN_MIN_WIDTH = 75;

const StyledColumnHeaderCell = styled.th<{
  columnWidth: number;
  isResizing?: boolean;
}>`
  ${({ columnWidth }) => `
    min-width: ${columnWidth}px;
    width: ${columnWidth}px;
  `}
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

const StyledAddIconButtonWrapper = styled.div`
  display: inline-flex;
  position: relative;
`;

const StyledAddIconButton = styled(IconButton)`
  border-radius: 0;
`;

const StyledEntityTableColumnMenu = styled(EntityTableColumnMenu)`
  position: absolute;
  right: 0;
  top: 100%;
  z-index: ${({ theme }) => theme.lastLayerZIndex};
`;

export function EntityTableHeader() {
  const theme = useTheme();

  const [{ objectName }, setViewFieldsState] = useRecoilState(viewFieldsState);
  const viewFields = useRecoilValue(visibleViewFieldsState);
  const columnWidths = useRecoilValue(columnWidthByViewFieldIdState);
  const addableViewFieldDefinitions = useRecoilValue(
    addableViewFieldDefinitionsState,
  );
  const [offset, setOffset] = useRecoilState(resizeFieldOffsetState);

  const [initialPointerPositionX, setInitialPointerPositionX] = useState<
    number | null
  >(null);
  const [resizedFieldId, setResizedFieldId] = useState<string | null>(null);
  const [isColumnMenuOpen, setIsColumnMenuOpen] = useState(false);

  const [createViewFieldMutation] = useCreateViewFieldMutation();
  const [updateViewFieldMutation] = useUpdateViewFieldMutation();

  const handleResizeHandlerStart = useCallback((positionX: number) => {
    setInitialPointerPositionX(positionX);
  }, []);

  const handleResizeHandlerMove = useCallback(
    (positionX: number) => {
      if (!initialPointerPositionX) return;
      setOffset(positionX - initialPointerPositionX);
    },
    [setOffset, initialPointerPositionX],
  );

  const handleResizeHandlerEnd = useRecoilCallback(
    ({ snapshot, set }) =>
      () => {
        if (!resizedFieldId) return;

        const nextWidth = Math.round(
          Math.max(
            columnWidths[resizedFieldId] +
              snapshot.getLoadable(resizeFieldOffsetState).valueOrThrow(),
            COLUMN_MIN_WIDTH,
          ),
        );

        if (nextWidth !== columnWidths[resizedFieldId]) {
          // Optimistic update to avoid "bouncing width" visual effect on resize.
          setViewFieldsState((previousState) => ({
            ...previousState,
            viewFields: previousState.viewFields.map((viewField) =>
              viewField.id === resizedFieldId
                ? { ...viewField, columnSize: nextWidth }
                : viewField,
            ),
          }));

          updateViewFieldMutation({
            variables: {
              data: { sizeInPx: nextWidth },
              where: { id: resizedFieldId },
            },
            refetchQueries: [getOperationName(GET_VIEW_FIELDS) ?? ''],
          });
        }

        set(resizeFieldOffsetState, 0);
        setInitialPointerPositionX(null);
        setResizedFieldId(null);
      },
    [resizedFieldId, columnWidths, setResizedFieldId],
  );

  useTrackPointer({
    shouldTrackPointer: resizedFieldId !== null,
    onMouseDown: handleResizeHandlerStart,
    onMouseMove: handleResizeHandlerMove,
    onMouseUp: handleResizeHandlerEnd,
  });

  const toggleColumnMenu = useCallback(() => {
    setIsColumnMenuOpen((previousValue) => !previousValue);
  }, []);

  const handleAddViewField = useCallback(
    (viewFieldDefinition: ViewFieldDefinition<ViewFieldMetadata>) => {
      setIsColumnMenuOpen(false);

      if (!objectName) return;

      createViewFieldMutation({
        variables: {
          data: toViewFieldInput(objectName, {
            ...viewFieldDefinition,
            columnOrder: viewFields.length + 1,
          }),
        },
        refetchQueries: [getOperationName(GET_VIEW_FIELDS) ?? ''],
      });
    },
    [createViewFieldMutation, objectName, viewFields.length],
  );

  return (
    <thead data-select-disable>
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
            key={viewField.id}
            isResizing={resizedFieldId === viewField.id}
            columnWidth={Math.max(
              columnWidths[viewField.id] +
                (resizedFieldId === viewField.id ? offset : 0),
              COLUMN_MIN_WIDTH,
            )}
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
        <th>
          {addableViewFieldDefinitions.length > 0 && (
            <StyledAddIconButtonWrapper>
              <StyledAddIconButton
                size="large"
                icon={<IconPlus size={theme.icon.size.md} />}
                onClick={toggleColumnMenu}
              />
              {isColumnMenuOpen && (
                <StyledEntityTableColumnMenu
                  onAddViewField={handleAddViewField}
                  onClickOutside={toggleColumnMenu}
                  viewFieldDefinitions={addableViewFieldDefinitions}
                />
              )}
            </StyledAddIconButtonWrapper>
          )}
        </th>
      </tr>
    </thead>
  );
}
