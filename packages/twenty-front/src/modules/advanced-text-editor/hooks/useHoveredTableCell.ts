import { type HoveredTableCell } from '@/advanced-text-editor/types/HoveredTableCell';
import { getHoveredTableCell } from '@/advanced-text-editor/utils/getHoveredTableCell';
import { type Editor } from '@tiptap/core';
import { type MouseEvent, useState } from 'react';
import { isDefined } from 'twenty-shared/utils';

export const useHoveredTableCell = ({
  editor,
  isEnabled,
}: {
  editor: Editor;
  isEnabled: boolean;
}) => {
  const [hoveredTableCell, setHoveredTableCell] =
    useState<HoveredTableCell | null>(null);
  const [isTableMenuOpen, setIsTableMenuOpen] = useState(false);

  const handleMouseMove = (event: MouseEvent<HTMLDivElement>) => {
    if (
      !isEnabled ||
      isTableMenuOpen ||
      !(event.target instanceof Element) ||
      isDefined(event.target.closest('[data-table-handle]'))
    ) {
      return;
    }

    setHoveredTableCell(
      getHoveredTableCell({
        view: editor.view,
        target: event.target,
        container: event.currentTarget,
      }),
    );
  };

  const handleMouseLeave = () => {
    if (!isTableMenuOpen) {
      setHoveredTableCell(null);
    }
  };

  const handleTableMenuOpenChange = (isOpen: boolean) => {
    setIsTableMenuOpen(isOpen);

    if (!isOpen) {
      setHoveredTableCell(null);
    }
  };

  const clearHoveredTableCell = () => setHoveredTableCell(null);

  return {
    hoveredTableCell,
    handleMouseMove,
    handleMouseLeave,
    handleTableMenuOpenChange,
    clearHoveredTableCell,
  };
};
