import { RefObject } from 'react';
import {
  boxesIntersect,
  useSelectionContainer,
} from '@air/react-drag-to-select';

type OwnProps = {
  dragSelectable: RefObject<HTMLElement>;
  onDragSelectionChange: (id: string, selected: boolean) => void;
  onDragSelectionStart: () => void;
};

export function DragSelect({
  dragSelectable,
  onDragSelectionChange,
  onDragSelectionStart,
}: OwnProps) {
  const { DragSelection } = useSelectionContainer({
    onSelectionStart: onDragSelectionStart,
    onSelectionChange: (box) => {
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
        border: '1px solid #4C85D8',
        background: 'rgba(155, 193, 239, 0.4)',
        position: `absolute`,
        zIndex: 99,
      },
    },
  });

  return <DragSelection />;
}
