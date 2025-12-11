import { type Block } from '@blocknote/core';
import { useBlockNoteEditor } from '@blocknote/react';
import styled from '@emotion/styled';
import {
  autoUpdate,
  flip,
  offset,
  shift,
  useFloating,
} from '@floating-ui/react';
import { useLingui } from '@lingui/react/macro';
import { useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { IconColorSwatch, IconPlus, IconTrash } from 'twenty-ui/display';
import { MenuItem } from 'twenty-ui/navigation';

import { type BLOCK_SCHEMA } from '@/activities/blocks/constants/Schema';
import { PortaledBlockColorPicker } from '@/page-layout/widgets/standalone-rich-text/components/PortaledBlockColorPicker';
import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { OverlayContainer } from '@/ui/layout/overlay/components/OverlayContainer';
import { useListenClickOutside } from '@/ui/utilities/pointer-event/hooks/useListenClickOutside';

type PortaledDragHandleMenuProps = {
  editor: typeof BLOCK_SCHEMA.BlockNoteEditor;
  block: Block;
  anchorElement: HTMLElement | null;
  boundaryElement?: HTMLElement | null;
  onClose: () => void;
};

const DRAG_HANDLE_MENU_CLICK_OUTSIDE_ID = 'drag-handle-menu-click-outside';

const StyledColorMenuItem = styled.div`
  position: relative;
`;

export const PortaledDragHandleMenu = ({
  editor,
  block,
  anchorElement,
  boundaryElement,
  onClose,
}: PortaledDragHandleMenuProps) => {
  const { t } = useLingui();
  const blockNoteEditor = useBlockNoteEditor();
  const menuRef = useRef<HTMLDivElement>(null);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [colorMenuItemElement, setColorMenuItemElement] =
    useState<HTMLDivElement | null>(null);

  const { refs, floatingStyles } = useFloating({
    placement: 'right-start',
    whileElementsMounted: autoUpdate,
    elements: {
      reference: anchorElement,
    },
    middleware: [
      offset(4),
      flip({
        boundary: boundaryElement ?? undefined,
      }),
      shift({
        boundary: boundaryElement ?? undefined,
        padding: 8,
      }),
    ],
  });

  useListenClickOutside({
    refs: [menuRef],
    excludedClickOutsideIds: [DRAG_HANDLE_MENU_CLICK_OUTSIDE_ID],
    callback: () => {
      if (!showColorPicker) {
        onClose();
      }
    },
    listenerId: 'portaled-drag-handle-menu',
  });

  const handleAddBlock = () => {
    const currentBlock = blockNoteEditor.getTextCursorPosition().block;
    editor.insertBlocks([{ type: 'paragraph' }], currentBlock, 'after');

    const nextBlock = blockNoteEditor.getTextCursorPosition().nextBlock;
    if (nextBlock !== undefined) {
      editor.setTextCursorPosition(nextBlock);
    }

    editor.openSuggestionMenu('/');
    onClose();
  };

  const handleDelete = () => {
    editor.removeBlocks([block]);
    onClose();
  };

  const handleColorClick = () => {
    setShowColorPicker(true);
  };

  const handleColorPickerClose = () => {
    setShowColorPicker(false);
  };

  const handleColorSelect = (
    textColor: string | undefined,
    backgroundColor: string | undefined,
  ) => {
    editor.updateBlock(block, {
      props: {
        ...(textColor !== undefined && { textColor }),
        ...(backgroundColor !== undefined && { backgroundColor }),
      },
    });
    setShowColorPicker(false);
    onClose();
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
          data-click-outside-id={DRAG_HANDLE_MENU_CLICK_OUTSIDE_ID}
        >
          <DropdownContent>
            <DropdownMenuItemsContainer>
              <MenuItem
                LeftIcon={IconPlus}
                onClick={handleAddBlock}
                accent="default"
                text={t`Add Block`}
              />
              <StyledColorMenuItem ref={setColorMenuItemElement}>
                <MenuItem
                  LeftIcon={IconColorSwatch}
                  onClick={handleColorClick}
                  accent="default"
                  text={t`Change Color`}
                />
              </StyledColorMenuItem>
              <MenuItem
                LeftIcon={IconTrash}
                onClick={handleDelete}
                accent="danger"
                text={t`Delete`}
              />
            </DropdownMenuItemsContainer>
          </DropdownContent>
        </OverlayContainer>,
        document.body,
      )}

      {showColorPicker && colorMenuItemElement && (
        <PortaledBlockColorPicker
          anchorElement={colorMenuItemElement}
          block={block}
          onClose={handleColorPickerClose}
          onColorSelect={handleColorSelect}
        />
      )}
    </>
  );
};
