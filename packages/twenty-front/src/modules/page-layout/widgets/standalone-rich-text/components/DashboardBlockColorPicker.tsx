import { type Block } from '@blocknote/core';
import {
  autoUpdate,
  flip,
  offset,
  shift,
  useFloating,
} from '@floating-ui/react';
import { useRef } from 'react';
import { createPortal } from 'react-dom';

import { DashboardColorSelectionMenu } from '@/page-layout/widgets/standalone-rich-text/components/DashboardColorSelectionMenu';
import { COLOR_PICKER_FLOATING_CONFIG } from '@/page-layout/widgets/standalone-rich-text/constants/ColorPickerFloatingConfig';
import { type BlockNoteColor } from '@/page-layout/widgets/standalone-rich-text/types/BlockNoteColor';
import { extractColorFromProps } from '@/page-layout/widgets/standalone-rich-text/utils/extractColorFromProps';
import { OverlayContainer } from '@/ui/layout/overlay/components/OverlayContainer';
import { useListenClickOutside } from '@/ui/utilities/pointer-event/hooks/useListenClickOutside';

type DashboardBlockColorPickerProps = {
  block: Block;
  anchorElement: HTMLElement | null;
  onClose: () => void;
  onColorSelect: (
    textColor: BlockNoteColor | undefined,
    backgroundColor: string | undefined,
  ) => void;
};

const COLOR_PICKER_CLICK_OUTSIDE_ID = 'color-picker-click-outside';

export const DashboardBlockColorPicker = ({
  block,
  anchorElement,
  onClose,
  onColorSelect,
}: DashboardBlockColorPickerProps) => {
  const menuRef = useRef<HTMLDivElement>(null);

  const currentTextColor = extractColorFromProps(block.props, 'text');
  const currentBackgroundColor = extractColorFromProps(
    block.props,
    'background',
  );

  const { refs, floatingStyles } = useFloating({
    placement: 'right-start',
    whileElementsMounted: autoUpdate,
    elements: {
      reference: anchorElement,
    },
    middleware: [
      offset(COLOR_PICKER_FLOATING_CONFIG.offsetFromMenuItem),
      flip(),
      shift({
        padding: COLOR_PICKER_FLOATING_CONFIG.boundaryPadding,
      }),
    ],
  });

  useListenClickOutside({
    refs: [menuRef],
    excludedClickOutsideIds: [COLOR_PICKER_CLICK_OUTSIDE_ID],
    callback: onClose,
    listenerId: 'dashboard-block-color-picker',
  });

  const handleTextColorSelect = (color: BlockNoteColor) => {
    onColorSelect(color, undefined);
  };

  const handleBackgroundColorSelect = (color: BlockNoteColor) => {
    onColorSelect(undefined, color);
  };

  return (
    <>
      {createPortal(
        <OverlayContainer
          ref={(node) => {
            refs.setFloating(node);
            (menuRef as React.MutableRefObject<HTMLDivElement | null>).current =
              node;
          }}
          style={floatingStyles}
          className="bn-ui-container"
          data-click-outside-id={COLOR_PICKER_CLICK_OUTSIDE_ID}
        >
          <DashboardColorSelectionMenu
            currentTextColor={currentTextColor}
            currentBackgroundColor={currentBackgroundColor}
            onTextColorSelect={handleTextColorSelect}
            onBackgroundColorSelect={handleBackgroundColorSelect}
          />
        </OverlayContainer>,
        document.body,
      )}
    </>
  );
};
