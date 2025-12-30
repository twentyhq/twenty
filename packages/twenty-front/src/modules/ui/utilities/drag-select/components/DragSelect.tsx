import styled from '@emotion/styled';
import { type RefObject, useCallback, useState } from 'react';

import { useDragSelect } from '@/ui/utilities/drag-select/hooks/useDragSelect';
import { useDragSelectWithAutoScroll } from '@/ui/utilities/drag-select/hooks/useDragSelectWithAutoScroll';
import { useTrackPointer } from '@/ui/utilities/pointer-event/hooks/useTrackPointer';
import { isDefined } from 'twenty-shared/utils';
import { isDeeplyEqual } from '~/utils/isDeeplyEqual';
import { type SelectionBox } from '@/ui/utilities/drag-select/types/SelectionBox';
import { isValidSelectionStart } from '@/ui/utilities/drag-select/utils/selectionBoxValidation';

type DragSelectProps = {
  selectableItemsContainerRef: RefObject<HTMLElement>;
  onDragSelectionChange: (id: string, selected: boolean) => void;
  onDragSelectionStart?: (event: MouseEvent | TouchEvent) => void;
  onDragSelectionEnd?: (event: MouseEvent | TouchEvent) => void;
  scrollWrapperComponentInstanceId?: string;
  selectionBoundaryClass?: string;
};

type Position = {
  x: number;
  y: number;
};

const StyledDragSelection = styled.div<SelectionBox>`
  position: absolute;
  z-index: 99;
  opacity: 0.2;
  border: 1px solid ${({ theme }) => theme.color.blue3};
  background: ${({ theme }) => theme.color.blue7};
  top: ${({ top }) => top}px;
  left: ${({ left }) => left}px;
  width: ${({ width }) => width}px;
  height: ${({ height }) => height}px;
`;

export const DragSelect = ({
  selectableItemsContainerRef,
  onDragSelectionChange,
  onDragSelectionStart,
  onDragSelectionEnd,
  scrollWrapperComponentInstanceId,
  selectionBoundaryClass,
}: DragSelectProps) => {
  const { isDragSelectionStartEnabled } = useDragSelect();

  const [isDragging, setIsDragging] = useState(false);
  const [isSelecting, setIsSelecting] = useState(false);

  const boxesIntersect = useCallback(
    (boxA: SelectionBox, boxB: SelectionBox) =>
      boxA.left <= boxB.left + boxB.width &&
      boxA.left + boxA.width >= boxB.left &&
      boxA.top <= boxB.top + boxB.height &&
      boxA.top + boxA.height >= boxB.top,
    [],
  );

  const { handleAutoScroll } = useDragSelectWithAutoScroll({
    scrollWrapperComponentInstanceId,
  });

  const [startPoint, setStartPoint] = useState<Position | null>(null);
  const [endPoint, setEndPoint] = useState<Position | null>(null);
  const [selectionBox, setSelectionBox] = useState<SelectionBox | null>(null);

  const getPositionRelativeToContainer = useCallback(
    (x: number, y: number) => {
      const containerRect =
        selectableItemsContainerRef.current?.getBoundingClientRect();
      if (!containerRect) {
        return { x, y };
      }
      return { x: x - containerRect.left, y: y - containerRect.top };
    },
    [selectableItemsContainerRef],
  );

  useTrackPointer({
    onMouseDown: ({ x, y, event }) => {
      const { x: relativeX, y: relativeY } = getPositionRelativeToContainer(
        x,
        y,
      );

      if (shouldStartSelecting(event.target)) {
        setIsDragging(true);
        setIsSelecting(false);
        setStartPoint({
          x: relativeX,
          y: relativeY,
        });
        setEndPoint({
          x: relativeX,
          y: relativeY,
        });
        setSelectionBox({
          top: relativeY,
          left: relativeX,
          width: 0,
          height: 0,
        });
        event.preventDefault();
      }
    },
    onMouseMove: ({ x, y, event }) => {
      if (isDragging) {
        const { x: relativeX, y: relativeY } = getPositionRelativeToContainer(
          x,
          y,
        );

        if (
          !isDefined(startPoint) ||
          !isDefined(endPoint) ||
          !isDefined(selectionBox)
        ) {
          return;
        }

        const newEndPoint = { ...endPoint };

        newEndPoint.x = relativeX;
        newEndPoint.y = relativeY;

        if (!isDeeplyEqual(newEndPoint, endPoint)) {
          setEndPoint(newEndPoint);

          const newSelectionBox = {
            top: Math.min(startPoint.y, newEndPoint.y),
            left: Math.min(startPoint.x, newEndPoint.x),
            width: Math.abs(newEndPoint.x - startPoint.x),
            height: Math.abs(newEndPoint.y - startPoint.y),
          };

          if (isValidSelectionStart(newSelectionBox)) {
            if (!isSelecting) {
              setIsSelecting(true);
              onDragSelectionStart?.(event);
            }
            setSelectionBox(newSelectionBox);
          } else if (isSelecting) {
            setSelectionBox(newSelectionBox);
          }
        }

        if (isSelecting && isDefined(selectionBox)) {
          const scrollAwareBox = {
            ...selectionBox,
            top: selectionBox.top + window.scrollY,
            left: selectionBox.left + window.scrollX,
          };

          Array.from(
            selectableItemsContainerRef.current?.querySelectorAll(
              '[data-selectable-id]',
            ) ?? [],
          ).forEach((item) => {
            const id = item.getAttribute('data-selectable-id');
            if (!isDefined(id)) {
              return;
            }
            const itemBox = item.getBoundingClientRect();

            const { x: boxX, y: boxY } = getPositionRelativeToContainer(
              itemBox.left,
              itemBox.top,
            );

            if (
              boxesIntersect(scrollAwareBox, {
                width: itemBox.width,
                height: itemBox.height,
                top: boxY,
                left: boxX,
              })
            ) {
              onDragSelectionChange(id, true);
            } else {
              onDragSelectionChange(id, false);
            }
          });
        }

        handleAutoScroll(x, y);
      }
    },
    onMouseUp: ({ event }) => {
      if (isSelecting) {
        onDragSelectionEnd?.(event);
      }
      setIsDragging(false);
      setIsSelecting(false);
    },
  });

  const shouldStartSelecting = useCallback(
    (target: EventTarget | null) => {
      if (!isDragSelectionStartEnabled()) {
        return false;
      }

      if (!(target instanceof Node)) {
        return false;
      }

      const selectionBoundaryElement = selectionBoundaryClass
        ? (selectableItemsContainerRef.current?.closest(
            `.${selectionBoundaryClass}`,
          ) ?? selectableItemsContainerRef.current)
        : selectableItemsContainerRef.current;

      if (!selectionBoundaryElement?.contains(target)) {
        return false;
      }

      if (target instanceof HTMLElement || target instanceof SVGElement) {
        let el = target;
        while (el.parentElement && !el.dataset.selectDisable) {
          el = el.parentElement;
        }

        if (el.dataset.selectDisable === 'true') {
          return false;
        }
      }

      return true;
    },
    [
      isDragSelectionStartEnabled,
      selectableItemsContainerRef,
      selectionBoundaryClass,
    ],
  );

  return (
    isDragging &&
    isSelecting &&
    isDefined(selectionBox) && (
      <StyledDragSelection
        top={selectionBox.top}
        left={selectionBox.left}
        width={selectionBox.width}
        height={selectionBox.height}
      />
    )
  );
};
