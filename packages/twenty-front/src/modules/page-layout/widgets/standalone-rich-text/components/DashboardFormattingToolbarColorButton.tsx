import {
  useBlockNoteEditor,
  useEditorContentOrSelectionChange,
} from '@blocknote/react';
import styled from '@emotion/styled';
import {
  autoUpdate,
  flip,
  offset,
  shift,
  useFloating,
} from '@floating-ui/react';
import { useRef, useState } from 'react';
import { createPortal } from 'react-dom';

import { DashboardColorIcon } from '@/page-layout/widgets/standalone-rich-text/components/DashboardColorIcon';
import { DashboardColorSelectionMenu } from '@/page-layout/widgets/standalone-rich-text/components/DashboardColorSelectionMenu';
import { COLOR_DROPDOWN_FLOATING_CONFIG } from '@/page-layout/widgets/standalone-rich-text/constants/ColorDropdownFloatingConfig';
import { type BlockNoteColor } from '@/page-layout/widgets/standalone-rich-text/types/BlockNoteColor';
import { extractColorFromProps } from '@/page-layout/widgets/standalone-rich-text/utils/extractColorFromProps';
import { OverlayContainer } from '@/ui/layout/overlay/components/OverlayContainer';
import { useListenClickOutside } from '@/ui/utilities/pointer-event/hooks/useListenClickOutside';
import { isDefined } from 'twenty-shared/utils';

const StyledColorButton = styled.button`
  align-items: center;
  background: transparent;
  border: none;
  border-radius: ${({ theme }) => theme.border.radius.sm};
  cursor: pointer;
  display: flex;
  height: 24px;
  justify-content: center;
  padding: ${({ theme }) => theme.spacing(1)};
  width: 24px;

  &:hover {
    background: ${({ theme }) => theme.background.transparent.light};
  }
`;

const COLOR_BUTTON_CLICK_OUTSIDE_ID = 'color-button-click-outside';

export const DashboardFormattingToolbarColorButton = () => {
  const editor = useBlockNoteEditor();
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const [isOpen, setIsOpen] = useState(false);

  const [currentTextColor, setCurrentTextColor] =
    useState<BlockNoteColor>('default');
  const [currentBackgroundColor, setCurrentBackgroundColor] =
    useState<BlockNoteColor>('default');

  useEditorContentOrSelectionChange(() => {
    const activeStyles = editor.getActiveStyles();
    setCurrentTextColor(extractColorFromProps(activeStyles, 'text'));
    setCurrentBackgroundColor(
      extractColorFromProps(activeStyles, 'background'),
    );
  }, editor);

  const { refs, floatingStyles } = useFloating({
    placement: 'bottom-start',
    whileElementsMounted: autoUpdate,
    middleware: [
      offset(COLOR_DROPDOWN_FLOATING_CONFIG.offsetFromButton),
      flip(),
      shift({ padding: COLOR_DROPDOWN_FLOATING_CONFIG.boundaryPadding }),
    ],
  });

  useListenClickOutside({
    refs: [menuRef],
    excludedClickOutsideIds: [COLOR_BUTTON_CLICK_OUTSIDE_ID],
    callback: () => setIsOpen(false),
    listenerId: 'custom-color-style-button',
  });

  const handleButtonClick = () => {
    if (isDefined(buttonRef.current)) {
      refs.setReference(buttonRef.current);
    }
    setIsOpen(!isOpen);
  };

  const applyTextColor = (color: string) => {
    if (color === 'default') {
      editor.removeStyles({ textColor: color });
    } else {
      editor.addStyles({ textColor: color });
    }
    setTimeout(() => editor.focus());
  };

  const applyBackgroundColor = (color: string) => {
    if (color === 'default') {
      editor.removeStyles({ backgroundColor: color });
    } else {
      editor.addStyles({ backgroundColor: color });
    }
    setTimeout(() => editor.focus());
  };

  const handleTextColorSelect = (color: BlockNoteColor) => {
    applyTextColor(color);
    setIsOpen(false);
  };

  const handleBackgroundColorSelect = (color: BlockNoteColor) => {
    applyBackgroundColor(color);
    setIsOpen(false);
  };

  return (
    <>
      <StyledColorButton
        ref={buttonRef}
        onClick={handleButtonClick}
        data-click-outside-id={COLOR_BUTTON_CLICK_OUTSIDE_ID}
      >
        <DashboardColorIcon
          textColor={currentTextColor}
          backgroundColor={currentBackgroundColor}
        />
      </StyledColorButton>

      {isOpen &&
        createPortal(
          <OverlayContainer
            ref={(node) => {
              refs.setFloating(node);
              (
                menuRef as React.MutableRefObject<HTMLDivElement | null>
              ).current = node;
            }}
            style={floatingStyles}
            className="bn-ui-container"
            data-click-outside-id={COLOR_BUTTON_CLICK_OUTSIDE_ID}
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
