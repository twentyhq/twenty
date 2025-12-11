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
import { useCallback, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { IconCheck } from 'twenty-ui/display';

import { BlockNoteColorIcon } from '@/page-layout/widgets/standalone-rich-text/components/BlockNoteColorIcon';
import { BLOCKNOTE_COLOR_DISPLAY_NAMES } from '@/page-layout/widgets/standalone-rich-text/constants/BlockNoteColorDisplayNames';
import { BLOCKNOTE_COLORS } from '@/page-layout/widgets/standalone-rich-text/constants/BlockNoteColors';
import { type BlockNoteColor } from '@/page-layout/widgets/standalone-rich-text/types/BlockNoteColor';
import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { DropdownMenuSectionLabel } from '@/ui/layout/dropdown/components/DropdownMenuSectionLabel';
import { DropdownMenuSeparator } from '@/ui/layout/dropdown/components/DropdownMenuSeparator';
import { OverlayContainer } from '@/ui/layout/overlay/components/OverlayContainer';
import { useListenClickOutside } from '@/ui/utilities/pointer-event/hooks/useListenClickOutside';

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

const StyledColorMenuItem = styled.div`
  align-items: center;
  border-radius: ${({ theme }) => theme.border.radius.sm};
  cursor: pointer;
  display: flex;
  gap: ${({ theme }) => theme.spacing(2)};
  min-height: 24px;
  padding: ${({ theme }) => theme.spacing(1)} ${({ theme }) => theme.spacing(2)};

  &:hover {
    background: ${({ theme }) => theme.background.transparent.light};
  }
`;

const StyledColorName = styled.span`
  color: ${({ theme }) => theme.font.color.primary};
  flex: 1;
  font-size: ${({ theme }) => theme.font.size.sm};
`;

const StyledCheckIcon = styled.div`
  align-items: center;
  color: ${({ theme }) => theme.font.color.primary};
  display: flex;
  height: 16px;
  justify-content: center;
  width: 16px;
`;

const COLOR_BUTTON_CLICK_OUTSIDE_ID = 'color-button-click-outside';

export const CustomColorStyleButton = () => {
  const editor = useBlockNoteEditor();
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const [isOpen, setIsOpen] = useState(false);

  const [currentTextColor, setCurrentTextColor] = useState<string>('default');
  const [currentBackgroundColor, setCurrentBackgroundColor] =
    useState<string>('default');

  useEditorContentOrSelectionChange(() => {
    const activeStyles = editor.getActiveStyles();
    setCurrentTextColor(
      (activeStyles as { textColor?: string }).textColor ?? 'default',
    );
    setCurrentBackgroundColor(
      (activeStyles as { backgroundColor?: string }).backgroundColor ??
        'default',
    );
  }, editor);

  const { refs, floatingStyles } = useFloating({
    placement: 'bottom-start',
    whileElementsMounted: autoUpdate,
    middleware: [offset(12), flip(), shift({ padding: 8 })],
  });

  useListenClickOutside({
    refs: [menuRef],
    excludedClickOutsideIds: [COLOR_BUTTON_CLICK_OUTSIDE_ID],
    callback: () => setIsOpen(false),
    listenerId: 'custom-color-style-button',
  });

  const handleButtonClick = () => {
    if (buttonRef.current !== null) {
      refs.setReference(buttonRef.current);
    }
    setIsOpen(!isOpen);
  };

  const setTextColor = useCallback(
    (color: string) => {
      if (color === 'default') {
        editor.removeStyles({ textColor: color });
      } else {
        editor.addStyles({ textColor: color });
      }
      setTimeout(() => editor.focus());
    },
    [editor],
  );

  const setBackgroundColor = useCallback(
    (color: string) => {
      if (color === 'default') {
        editor.removeStyles({ backgroundColor: color });
      } else {
        editor.addStyles({ backgroundColor: color });
      }
      setTimeout(() => editor.focus());
    },
    [editor],
  );

  const handleTextColorSelect = (color: BlockNoteColor) => {
    setTextColor(color);
    setIsOpen(false);
  };

  const handleBackgroundColorSelect = (color: BlockNoteColor) => {
    setBackgroundColor(color);
    setIsOpen(false);
  };

  return (
    <>
      <StyledColorButton
        ref={buttonRef}
        onClick={handleButtonClick}
        data-click-outside-id={COLOR_BUTTON_CLICK_OUTSIDE_ID}
      >
        <BlockNoteColorIcon
          textColor={currentTextColor as BlockNoteColor}
          backgroundColor={currentBackgroundColor as BlockNoteColor}
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
            <DropdownContent>
              <DropdownMenuItemsContainer hasMaxHeight>
                <DropdownMenuSectionLabel label="Text Colors" />

                {BLOCKNOTE_COLORS.map((colorName) => (
                  <StyledColorMenuItem
                    key={`text-${colorName}`}
                    onClick={() => handleTextColorSelect(colorName)}
                  >
                    <BlockNoteColorIcon textColor={colorName} />
                    <StyledColorName>
                      {BLOCKNOTE_COLOR_DISPLAY_NAMES[colorName]}
                    </StyledColorName>
                    {currentTextColor === colorName && (
                      <StyledCheckIcon>
                        <IconCheck size={14} />
                      </StyledCheckIcon>
                    )}
                  </StyledColorMenuItem>
                ))}

                <DropdownMenuSeparator />

                <DropdownMenuSectionLabel label="Background Colors" />
                {BLOCKNOTE_COLORS.map((colorName) => (
                  <StyledColorMenuItem
                    key={`bg-${colorName}`}
                    onClick={() => handleBackgroundColorSelect(colorName)}
                  >
                    <BlockNoteColorIcon backgroundColor={colorName} />
                    <StyledColorName>
                      {BLOCKNOTE_COLOR_DISPLAY_NAMES[colorName]}
                    </StyledColorName>
                    {currentBackgroundColor === colorName && (
                      <StyledCheckIcon>
                        <IconCheck size={14} />
                      </StyledCheckIcon>
                    )}
                  </StyledColorMenuItem>
                ))}
              </DropdownMenuItemsContainer>
            </DropdownContent>
          </OverlayContainer>,
          document.body,
        )}
    </>
  );
};
