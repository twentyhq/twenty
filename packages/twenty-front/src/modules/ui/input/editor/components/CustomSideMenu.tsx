import { type BLOCK_SCHEMA } from '@/activities/blocks/constants/Schema';
import { CustomAddBlockItem } from '@/ui/input/editor/components/CustomAddBlockItem';
import { CustomSideMenuOptions } from '@/ui/input/editor/components/CustomSideMenuOptions';
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
      sideMenu={(props) => (
        // eslint-disable-next-line react/jsx-props-no-spreading
        <SideMenu {...props}>
          <DragHandleButton
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...props}
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
      )}
    />
  );
};
