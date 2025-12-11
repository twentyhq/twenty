import { type BLOCK_SCHEMA } from '@/activities/blocks/constants/Schema';
import { CustomAddBlockItem } from '@/ui/input/editor/components/CustomAddBlockItem';
import { CustomSideMenuOptions } from '@/ui/input/editor/components/CustomSideMenuOptions';
import {
  BlockColorsItem,
  DragHandleButton,
  DragHandleMenu,
  RemoveBlockItem,
  SideMenu,
  useBlockNoteEditor,
  useUIElementPositioning,
  useUIPluginState,
} from '@blocknote/react';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { FloatingPortal, shift } from '@floating-ui/react';
import { useLingui } from '@lingui/react/macro';
import { IconColorSwatch, IconPlus, IconTrash } from 'twenty-ui/display';

type CustomSideMenuControllerProps = {
  editor: typeof BLOCK_SCHEMA.BlockNoteEditor;
  boundaryElement?: HTMLElement | null;
};

const StyledDivToCreateGap = styled.div`
  width: ${({ theme }) => theme.spacing(2)};
`;

// Custom SideMenuController that uses FloatingPortal to escape overflow:hidden containers.
// Based on BlockNote's SideMenuController but with portal support for dashboard widgets.
export const CustomSideMenuController = ({
  editor,
  boundaryElement,
}: CustomSideMenuControllerProps) => {
  const { t } = useLingui();
  const blockNoteEditor = useBlockNoteEditor();
  const theme = useTheme();
  const colorScheme = theme.name === 'light' ? 'light' : 'dark';

  const callbacks = {
    blockDragStart: blockNoteEditor.sideMenu.blockDragStart,
    blockDragEnd: blockNoteEditor.sideMenu.blockDragEnd,
    freezeMenu: blockNoteEditor.sideMenu.freezeMenu,
    unfreezeMenu: blockNoteEditor.sideMenu.unfreezeMenu,
  };

  const state = useUIPluginState(
    blockNoteEditor.sideMenu.onUpdate.bind(blockNoteEditor.sideMenu),
  );

  const { isMounted, ref, style, getFloatingProps } = useUIElementPositioning(
    state?.show || false,
    state?.referencePos || null,
    1000,
    {
      placement: 'left-start',
      middleware: [
        shift({
          boundary: boundaryElement ?? undefined,
          padding: 8,
        }),
      ],
    },
  );

  if (!isMounted || !state) {
    return null;
  }

  const { show: _show, referencePos: _referencePos, ...data } = state;

  return (
    <FloatingPortal>
      {/* bn-ui-container class prevents BlockNote from hiding menu on blur when clicking menu buttons */}
      {/* bn-container + bn-mantine classes and data attributes are required for BlockNote/Mantine CSS variables */}
      <div
        className="bn-container bn-mantine bn-ui-container"
        data-color-scheme={colorScheme}
        data-mantine-color-scheme={colorScheme}
        ref={ref}
        style={style}
        // eslint-disable-next-line react/jsx-props-no-spreading
        {...getFloatingProps()}
      >
        {/* eslint-disable-next-line react/jsx-props-no-spreading */}
        <SideMenu {...data} {...callbacks} editor={blockNoteEditor}>
          <DragHandleButton
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...data}
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...callbacks}
            editor={blockNoteEditor}
            dragHandleMenu={(props) => (
              // eslint-disable-next-line react/jsx-props-no-spreading
              <DragHandleMenu {...props}>
                <CustomAddBlockItem editor={editor}>
                  <CustomSideMenuOptions
                    LeftIcon={IconPlus}
                    text={t`Add Block`}
                    Variant="normal"
                  />
                </CustomAddBlockItem>
                {/* eslint-disable-next-line react/jsx-props-no-spreading */}
                <BlockColorsItem {...props}>
                  <CustomSideMenuOptions
                    LeftIcon={IconColorSwatch}
                    text={t`Change Color`}
                    Variant="normal"
                  />
                </BlockColorsItem>
                {/* eslint-disable-next-line react/jsx-props-no-spreading */}
                <RemoveBlockItem {...props}>
                  {' '}
                  <CustomSideMenuOptions
                    LeftIcon={IconTrash}
                    text={t`Delete`}
                    Variant="danger"
                  />
                </RemoveBlockItem>
              </DragHandleMenu>
            )}
          />
          <StyledDivToCreateGap />
        </SideMenu>
      </div>
    </FloatingPortal>
  );
};
