import { type Block } from '@blocknote/core';
import styled from '@emotion/styled';
import {
  autoUpdate,
  flip,
  offset,
  shift,
  useFloating,
} from '@floating-ui/react';
import { useLingui } from '@lingui/react/macro';
import { useRef } from 'react';
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

type PortaledBlockColorPickerProps = {
  block: Block;
  anchorElement: HTMLElement | null;
  onClose: () => void;
  onColorSelect: (
    textColor: string | undefined,
    backgroundColor: string | undefined,
  ) => void;
};

const COLOR_PICKER_CLICK_OUTSIDE_ID = 'color-picker-click-outside';

export const PortaledBlockColorPicker = ({
  block,
  anchorElement,
  onClose,
  onColorSelect,
}: PortaledBlockColorPickerProps) => {
  const { t } = useLingui();
  const menuRef = useRef<HTMLDivElement>(null);

  const currentTextColor =
    (block.props as { textColor?: string })?.textColor ?? 'default';
  const currentBackgroundColor =
    (block.props as { backgroundColor?: string })?.backgroundColor ?? 'default';

  const { refs, floatingStyles } = useFloating({
    placement: 'right-start',
    whileElementsMounted: autoUpdate,
    elements: {
      reference: anchorElement,
    },
    middleware: [
      offset(4),
      flip(),
      shift({
        padding: 8,
      }),
    ],
  });

  useListenClickOutside({
    refs: [menuRef],
    excludedClickOutsideIds: [COLOR_PICKER_CLICK_OUTSIDE_ID],
    callback: onClose,
    listenerId: 'portaled-block-color-picker',
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
          <DropdownContent>
            <DropdownMenuItemsContainer hasMaxHeight>
              <DropdownMenuSectionLabel label={t`Text Colors`} />

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

              <DropdownMenuSectionLabel label={t`Background Colors`} />
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
