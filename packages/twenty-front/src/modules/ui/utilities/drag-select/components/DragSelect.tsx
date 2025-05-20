import {
  boxesIntersect,
  useSelectionContainer,
} from '@air/react-drag-to-select';
import { useTheme } from '@emotion/react';
import { RefObject } from 'react';

import { useScrollToPosition } from '@/ui/utilities/scroll/hooks/useScrollToPosition';
import { scrollWrapperScrollTopComponentState } from '@/ui/utilities/scroll/states/scrollWrapperScrollTopComponentState';
import { useRecoilComponentValueV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValueV2';
import { RGBA } from 'twenty-ui/theme';
import { useDragSelect } from '../hooks/useDragSelect';

type DragSelectProps = {
  dragSelectable: RefObject<HTMLElement>;
  onDragSelectionChange: (id: string, selected: boolean) => void;
  onDragSelectionStart?: (event: MouseEvent) => void;
  onDragSelectionEnd?: (event: MouseEvent) => void;
};

export const DragSelect = ({
  dragSelectable,
  onDragSelectionChange,
  onDragSelectionStart,
  onDragSelectionEnd,
}: DragSelectProps) => {
  const theme = useTheme();

  const { isDragSelectionStartEnabled } = useDragSelect();

  const { scrollToPosition } = useScrollToPosition();
  const scrollTop = useRecoilComponentValueV2(
    scrollWrapperScrollTopComponentState,
  );

  const { DragSelection } = useSelectionContainer({
    shouldStartSelecting: (target) => {
      if (!isDragSelectionStartEnabled()) {
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
      const containerTopOnScreen =
        (dragSelectable.current?.getBoundingClientRect()?.top ?? 0) + scrollTop;

      const mouseY = box.top;

      if (mouseY < containerTopOnScreen) {
        scrollToPosition(scrollTop - 20);
      }

      const scrollAwareBox = {
        ...box,
        top: box.top + window.scrollY,
        left: box.left + window.scrollX,
      };

      Array.from(
        dragSelectable.current?.querySelectorAll('[data-selectable-id]') ?? [],
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
