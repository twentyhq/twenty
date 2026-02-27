import { type BLOCK_SCHEMA } from '@/blocknote-editor/blocks/Schema';
import { CustomAddBlockItem } from '@/blocknote-editor/components/CustomAddBlockItem';
import { CustomSideMenuOptions } from '@/blocknote-editor/components/CustomSideMenuOptions';
import {
  BlockColorsItem,
  DragHandleButton,
  DragHandleMenu,
  RemoveBlockItem,
  SideMenu,
  SideMenuController,
} from '@blocknote/react';
import styled from '@emotion/styled';
import { useLingui } from '@lingui/react/macro';
import { IconColorSwatch, IconPlus, IconTrash } from 'twenty-ui/display';

type CustomSideMenuProps = {
  editor: typeof BLOCK_SCHEMA.BlockNoteEditor;
};

const StyledDivToCreateGap = styled.div`
  width: ${({ theme }) => theme.spacing(2)};
`;

export const CustomSideMenu = ({ editor }: CustomSideMenuProps) => {
  const { t } = useLingui();
  return (
    <SideMenuController
      sideMenu={() => (
        <SideMenu>
          <DragHandleButton
            dragHandleMenu={() => (
              <DragHandleMenu>
                <CustomAddBlockItem editor={editor}>
                  <CustomSideMenuOptions
                    LeftIcon={IconPlus}
                    text={t`Add Block`}
                    Variant="normal"
                  />
                </CustomAddBlockItem>
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
