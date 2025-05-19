import {
  boxesIntersect,
  useSelectionContainer,
} from '@air/react-drag-to-select';
import { useTheme } from '@emotion/react';
import { RefObject } from 'react';

import { RGBA } from 'twenty-ui/theme';
import { useDragSelect } from '../hooks/useDragSelect';

type DragSelectProps = {
  selectableElementsRef: RefObject<HTMLElement>;
  selectionBoundaryRef?: RefObject<HTMLElement>;
  onDragSelectionChange: (id: string, selected: boolean) => void;
  onDragSelectionStart?: (event: MouseEvent) => void;
  onDragSelectionEnd?: (event: MouseEvent) => void;
};

export const DragSelect = ({
  selectableElementsRef,
  selectionBoundaryRef,
  onDragSelectionChange,
  onDragSelectionStart,
  onDragSelectionEnd,
}: DragSelectProps) => {
  const theme = useTheme();

  const { isDragSelectionStartEnabled } = useDragSelect();

  const { DragSelection } = useSelectionContainer({
    shouldStartSelecting: (target: EventTarget | null) => {
      if (!isDragSelectionStartEnabled()) {
        return false;
      }
      const isSelectionBoundaryRefProvided =
        !!selectionBoundaryRef?.current && target instanceof Node;
      if (isSelectionBoundaryRefProvided) {
        if (!selectionBoundaryRef.current.contains(target)) {
          return false;
        }
      } else if (
        target instanceof Node &&
        !selectableElementsRef.current?.contains(target)
      ) {
        return false;
      }
      if (target instanceof HTMLElement || target instanceof SVGElement) {
        let el = target;
        while (el.parentElement && !el.dataset.selectDisable) {
          el = el.parentElement;
        }

        return el.dataset.selectDisable !== 'true';
      }
      return true;
    },
    onSelectionStart: onDragSelectionStart,
    onSelectionEnd: onDragSelectionEnd,
    onSelectionChange: (box) => {
      const scrollAwareBox = {
        ...box,
        top: box.top + window.scrollY,
        left: box.left + window.scrollX,
      };
      Array.from(
        selectableElementsRef.current?.querySelectorAll(
          '[data-selectable-id]',
        ) ?? [],
      ).forEach((item) => {
        const id = item.getAttribute('data-selectable-id');
        if (!id) {
          return;
        }
        if (boxesIntersect(scrollAwareBox, item.getBoundingClientRect())) {
          onDragSelectionChange(id, true);
        } else {
          onDragSelectionChange(id, false);
        }
      });
    },
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
