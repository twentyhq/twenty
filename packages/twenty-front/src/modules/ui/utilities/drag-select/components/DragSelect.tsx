import {
  boxesIntersect,
  OnSelectionChange,
  useSelectionContainer,
} from '@air/react-drag-to-select';
import { useTheme } from '@emotion/react';
import { RefObject, useCallback } from 'react';

import { isDefined } from 'twenty-shared/utils';
import { RGBA } from 'twenty-ui/theme';
import { useDragSelect } from '../hooks/useDragSelect';
import { useDragSelectWithAutoScroll } from '../hooks/useDragSelectWithAutoScroll';

type DragSelectProps = {
  selectableItemsContainerRef: RefObject<HTMLElement>;
  onDragSelectionChange: (id: string, selected: boolean) => void;
  onDragSelectionStart?: (event: MouseEvent) => void;
  onDragSelectionEnd?: (event: MouseEvent) => void;
};

export const DragSelect = ({
  selectableItemsContainerRef,
  onDragSelectionChange,
  onDragSelectionStart,
  onDragSelectionEnd,
}: DragSelectProps) => {
  const theme = useTheme();
  const { isDragSelectionStartEnabled } = useDragSelect();

  const { handleDragStart, handleDragEnd } = useDragSelectWithAutoScroll({
    selectableItemsContainerRef,
  });

  const onSelectionChangeHandler: OnSelectionChange = useCallback(
    (box) => {
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
    [selectableItemsContainerRef, onDragSelectionChange],
  );

  const handleSelectionStart = useCallback(
    (event: MouseEvent) => {
      handleDragStart(event);
      onDragSelectionStart?.(event);
    },
    [onDragSelectionStart, handleDragStart],
  );

  const handleSelectionEnd = useCallback(
    (event: MouseEvent) => {
      handleDragEnd();
      onDragSelectionEnd?.(event);
    },
    [onDragSelectionEnd, handleDragEnd],
  );

  const shouldStartSelecting = useCallback(
    (target: EventTarget | null) => {
      if (!isDragSelectionStartEnabled()) {
        return false;
      }

      if (!(target instanceof Node)) {
        return false;
      }

      const selectionBoundaryElement =
        selectableItemsContainerRef.current?.closest(
          '.record-index-container-gater-for-drag-select',
        ) ?? selectableItemsContainerRef.current;

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
    [isDragSelectionStartEnabled, selectableItemsContainerRef],
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
