import { SuggestionMenu } from '@blocknote/core/extensions';
import {
  BlockColorsItem,
  DragHandleButton,
  DragHandleMenu,
  RemoveBlockItem,
  SideMenu,
  SideMenuController,
  useBlockNoteEditor,
  useComponentsContext,
} from '@blocknote/react';
import styled from '@emotion/styled';
import { useLingui } from '@lingui/react/macro';
import { IconColorSwatch, IconPlus, IconTrash } from 'twenty-ui/display';
import { isDefined } from 'twenty-shared/utils';

import { CustomSideMenuOptions } from '@/blocknote-editor/components/CustomSideMenuOptions';
import { type DASHBOARD_BLOCK_SCHEMA } from '@/page-layout/widgets/standalone-rich-text/constants/DashboardBlockSchema';

type DashboardEditorSideMenuProps = {
  editor: typeof DASHBOARD_BLOCK_SCHEMA.BlockNoteEditor;
};

const StyledDivToCreateGap = styled.div`
  width: ${({ theme }) => theme.spacing(2)};
`;

const DashboardAddBlockItem = ({
  editor,
  children,
}: {
  editor: typeof DASHBOARD_BLOCK_SCHEMA.BlockNoteEditor;
  children: React.ReactNode;
}) => {
  const Components = useComponentsContext();
  const blockNoteEditor = useBlockNoteEditor();

  if (!Components) {
    return null;
  }

  const handleClick = () => {
    const currentBlock = blockNoteEditor.getTextCursorPosition().block;

    const insertedBlocks = editor.insertBlocks(
      [{ type: 'paragraph' }],
      currentBlock,
      'after',
    );

    const insertedBlock = insertedBlocks[0];
    if (isDefined(insertedBlock)) {
      editor.setTextCursorPosition(insertedBlock);
    }

    blockNoteEditor.getExtension(SuggestionMenu)?.openSuggestionMenu('/');
  };

  return (
    <Components.Generic.Menu.Item onClick={handleClick}>
      {children}
    </Components.Generic.Menu.Item>
  );
};

export const DashboardEditorSideMenu = ({
  editor,
}: DashboardEditorSideMenuProps) => {
  const { t } = useLingui();

  return (
    <SideMenuController
      sideMenu={() => (
        <SideMenu>
          <DragHandleButton
            dragHandleMenu={() => (
              <DragHandleMenu>
                <DashboardAddBlockItem editor={editor}>
                  <CustomSideMenuOptions
                    LeftIcon={IconPlus}
                    text={t`Add Block`}
                    Variant="normal"
                  />
                </DashboardAddBlockItem>
                <BlockColorsItem>
                  <CustomSideMenuOptions
                    LeftIcon={IconColorSwatch}
                    text={t`Change Color`}
                    Variant="normal"
                  />
                </BlockColorsItem>
                <RemoveBlockItem>
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
      )}
    />
  );
};
