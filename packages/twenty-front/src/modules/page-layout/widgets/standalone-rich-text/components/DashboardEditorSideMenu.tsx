import { useBlockNoteEditor, useUIPluginState } from '@blocknote/react';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { autoUpdate, useFloating } from '@floating-ui/react';
import { useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { IconGripVertical } from 'twenty-ui/display';

import { type BLOCK_SCHEMA } from '@/activities/blocks/constants/Schema';
import { DashboardBlockDragHandleMenu } from '@/page-layout/widgets/standalone-rich-text/components/DashboardBlockDragHandleMenu';

type DashboardEditorSideMenuProps = {
  editor: typeof BLOCK_SCHEMA.BlockNoteEditor;
  boundaryElement?: HTMLElement | null;
};

const StyledSideMenuContainer = styled.div`
  display: flex;
`;

const StyledDragHandleContainer = styled.div`
  align-items: center;
  cursor: grab;
  display: flex;
  height: 20px;
  justify-content: center;
  width: 20px;

  border-radius: ${({ theme }) => theme.border.radius.sm};
  color: ${({ theme }) => theme.font.color.light};

  &:hover {
    background: ${({ theme }) => theme.background.transparent.light};
    color: ${({ theme }) => theme.font.color.primary};
  }

  &:active {
    cursor: grabbing;
  }
`;

const StyledDivToCreateGap = styled.div`
  width: ${({ theme }) => theme.spacing(2)};
`;

export const DashboardEditorSideMenu = ({
  editor,
  boundaryElement,
}: DashboardEditorSideMenuProps) => {
  const blockNoteEditor = useBlockNoteEditor();
  const theme = useTheme();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [dragHandleElement, setDragHandleElement] =
    useState<HTMLDivElement | null>(null);

  const state = useUIPluginState(
    blockNoteEditor.sideMenu.onUpdate.bind(blockNoteEditor.sideMenu),
  );

  const virtualReference = useMemo(() => {
    if (!state?.referencePos) return null;
    return {
      getBoundingClientRect: () => state.referencePos,
    };
  }, [state?.referencePos]);

  const { refs, floatingStyles } = useFloating({
    placement: 'left-start',
    whileElementsMounted: autoUpdate,
    elements: {
      reference: virtualReference,
    },
  });

  if (!state?.show || !virtualReference) {
    return null;
  }

  const handleClick = () => {
    blockNoteEditor.sideMenu.freezeMenu();
    setIsMenuOpen(true);
  };

  const handleDragStart = (event: React.DragEvent) => {
    blockNoteEditor.sideMenu.blockDragStart(
      {
        dataTransfer: event.dataTransfer,
        clientY: event.clientY,
      },
      state.block,
    );
  };

  const handleDragEnd = () => {
    blockNoteEditor.sideMenu.blockDragEnd();
  };

  const handleCloseMenu = () => {
    setIsMenuOpen(false);
    blockNoteEditor.sideMenu.unfreezeMenu();
  };

  return (
    <>
      {createPortal(
        <StyledSideMenuContainer
          ref={refs.setFloating}
          style={floatingStyles}
          className="bn-ui-container"
        >
          <StyledDragHandleContainer
            ref={setDragHandleElement}
            draggable
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            onClick={handleClick}
          >
            <IconGripVertical
              size={theme.icon.size.md}
              stroke={theme.icon.stroke.sm}
              color={theme.font.color.light}
            />
          </StyledDragHandleContainer>
          <StyledDivToCreateGap />
        </StyledSideMenuContainer>,
        document.body,
      )}

      {isMenuOpen && (
        <DashboardBlockDragHandleMenu
          editor={editor}
          block={state.block}
          anchorElement={dragHandleElement}
          boundaryElement={boundaryElement}
          onClose={handleCloseMenu}
        />
      )}
    </>
  );
};
