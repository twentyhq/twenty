import { BLOCK_SCHEMA } from '@/activities/blocks/constants/Schema';
import { CustomAddBlockItem } from '@/ui/input/editor/components/CustomAddBlockItem';
import { CustomSideMenuOptions } from '@/ui/input/editor/components/CustomSideMenuOptions';
import { useGoBackToPreviousDropdownFocusId } from '@/ui/layout/dropdown/hooks/useGoBackToPreviousDropdownFocusId';
import { useSetActiveDropdownFocusIdAndMemorizePrevious } from '@/ui/layout/dropdown/hooks/useSetFocusedDropdownIdAndMemorizePrevious';
import {
  BlockColorsItem,
  DragHandleButton,
  DragHandleMenu,
  RemoveBlockItem,
  SideMenu,
  SideMenuController,
} from '@blocknote/react';
import styled from '@emotion/styled';
import { useEffect } from 'react';
import { IconColorSwatch, IconPlus, IconTrash } from 'twenty-ui';

type CustomSideMenuProps = {
  editor: typeof BLOCK_SCHEMA.BlockNoteEditor;
};

const StyledDivToCreateGap = styled.div`
  width: ${({ theme }) => theme.spacing(2)};
`;

export const CustomSideMenu = ({ editor }: CustomSideMenuProps) => {
  const { setActiveDropdownFocusIdAndMemorizePrevious } =
    useSetActiveDropdownFocusIdAndMemorizePrevious();
  const { goBackToPreviousDropdownFocusId } =
    useGoBackToPreviousDropdownFocusId();

  useEffect(() => {
    setActiveDropdownFocusIdAndMemorizePrevious('custom-slash-menu');

    return () => {
      goBackToPreviousDropdownFocusId();
    };
  }, [
    setActiveDropdownFocusIdAndMemorizePrevious,
    goBackToPreviousDropdownFocusId,
  ]);

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
                    text={'Add Block'}
                    Variant="normal"
                  />
                </CustomAddBlockItem>
                {/* eslint-disable-next-line react/jsx-props-no-spreading */}
                <BlockColorsItem {...props}>
                  <CustomSideMenuOptions
                    LeftIcon={IconColorSwatch}
                    text={'Change Color'}
                    Variant="normal"
                  />
                </BlockColorsItem>
                {/* eslint-disable-next-line react/jsx-props-no-spreading */}
                <RemoveBlockItem {...props}>
                  {' '}
                  <CustomSideMenuOptions
                    LeftIcon={IconTrash}
                    text={'Delete'}
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
