import {
  boxesIntersect,
  OnSelectionChange,
  useSelectionContainer,
} from '@air/react-drag-to-select';
import { useTheme } from '@emotion/react';
import { RefObject, useCallback, useState } from 'react';

import { useTrackPointer } from '@/ui/utilities/pointer-event/hooks/useTrackPointer';
import { isDefined } from 'twenty-shared/utils';
import { RGBA } from 'twenty-ui/theme';
import { useDragSelect } from '../hooks/useDragSelect';
import { useDragSelectWithAutoScroll } from '../hooks/useDragSelectWithAutoScroll';

type DragSelectProps = {
  selectableItemsContainerRef: RefObject<HTMLElement>;
  onDragSelectionChange: (id: string, selected: boolean) => void;
  onDragSelectionStart?: (event: MouseEvent) => void;
  onDragSelectionEnd?: (event: MouseEvent) => void;
  scrollWrapperComponentInstanceId?: string;
  selectionBoundaryClass?: string;
};

export const DragSelect = ({
  selectableItemsContainerRef,
  onDragSelectionChange,
  onDragSelectionStart,
  onDragSelectionEnd,
  scrollWrapperComponentInstanceId,
  selectionBoundaryClass,
}: DragSelectProps) => {
  const theme = useTheme();
  const { isDragSelectionStartEnabled } = useDragSelect();
  const [currentMousePosition, setCurrentMousePosition] = useState<{
    x: number;
    y: number;
  } | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const { handleAutoScroll } = useDragSelectWithAutoScroll({
    scrollWrapperComponentInstanceId,
  });

  useTrackPointer({
    shouldTrackPointer: isDragging,
    onMouseMove: (x, y) => {
      setCurrentMousePosition({ x, y });
    },
    onMouseUp: () => {
      setIsDragging(false);
      setCurrentMousePosition(null);
    },
  });

  const onSelectionChangeHandler: OnSelectionChange = useCallback(
    (box) => {
      if (isDefined(currentMousePosition)) {
        handleAutoScroll(currentMousePosition.x, currentMousePosition.y);
      }

      const scrollAwareBox = {
        ...box,
        top: box.top + window.scrollY,
        left: box.left + window.scrollX,
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
        if (boxesIntersect(scrollAwareBox, item.getBoundingClientRect())) {
          onDragSelectionChange(id, true);
        } else {
          onDragSelectionChange(id, false);
        }
      });
    },
    [
      selectableItemsContainerRef,
      onDragSelectionChange,
      handleAutoScroll,
      currentMousePosition,
    ],
  );

  const handleSelectionStart = useCallback(
    (event: MouseEvent) => {
      setIsDragging(true);
      setCurrentMousePosition({ x: event.clientX, y: event.clientY });
      onDragSelectionStart?.(event);
    },
    [onDragSelectionStart],
  );

  const handleSelectionEnd = useCallback(
    (event: MouseEvent) => {
      setIsDragging(false);
      setCurrentMousePosition(null);
      onDragSelectionEnd?.(event);
    },
    [onDragSelectionEnd],
  );

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

  const { DragSelection } = useSelectionContainer({
    shouldStartSelecting,
    onSelectionStart: handleSelectionStart,
    onSelectionEnd: handleSelectionEnd,
    onSelectionChange: onSelectionChangeHandler,
    selectionProps: {
      style: {
        border: `1px solid ${theme.color.blue10}`,
        background: RGBA(theme.color.blue30, 0.4),
        position: `absolute`,
        zIndex: 99,
      },
    },
  });

  return <DragSelection />;
};
