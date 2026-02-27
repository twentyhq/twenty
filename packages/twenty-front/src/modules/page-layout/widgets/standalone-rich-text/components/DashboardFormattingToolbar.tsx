import {
  BasicTextStyleButton,
  BlockTypeSelect,
  CreateLinkButton,
  FormattingToolbar,
  FormattingToolbarController,
  NestBlockButton,
  TextAlignButton,
  UnnestBlockButton,
} from '@blocknote/react';
import { flip, offset, shift } from '@floating-ui/react';

import { DashboardFormattingToolbarColorButton } from '@/page-layout/widgets/standalone-rich-text/components/DashboardFormattingToolbarColorButton';
import { FORMATTING_TOOLBAR_FLOATING_CONFIG } from '@/page-layout/widgets/standalone-rich-text/constants/FormattingToolbarFloatingConfig';
import styled from '@emotion/styled';

const StyledToolbarContainer = styled.div`
  & .bn-formatting-toolbar .mantine-Button-root {
    height: 24px;
    min-height: 24px;
  }
`;

type DashboardFormattingToolbarProps = {
  boundaryElement?: HTMLElement | null;
};

export const DashboardFormattingToolbar = ({
  boundaryElement,
}: DashboardFormattingToolbarProps) => {
  return (
    <StyledToolbarContainer>
      <FormattingToolbarController
        formattingToolbar={() => (
          <FormattingToolbar>
            <BlockTypeSelect key="blockTypeSelect" />
            <BasicTextStyleButton basicTextStyle="bold" key="boldStyleButton" />
            <BasicTextStyleButton
              basicTextStyle="italic"
              key="italicStyleButton"
            />
            <BasicTextStyleButton
              basicTextStyle="underline"
              key="underlineStyleButton"
            />
            <BasicTextStyleButton
              basicTextStyle="strike"
              key="strikeStyleButton"
            />
            <TextAlignButton textAlignment="left" key="textAlignLeftButton" />
            <TextAlignButton
              textAlignment="center"
              key="textAlignCenterButton"
            />
            <TextAlignButton textAlignment="right" key="textAlignRightButton" />
            <DashboardFormattingToolbarColorButton key="colorStyleButton" />
            <NestBlockButton key="nestBlockButton" />
            <UnnestBlockButton key="unnestBlockButton" />
            <CreateLinkButton key="createLinkButton" />
          </FormattingToolbar>
        )}
        floatingUIOptions={{
          useFloatingOptions: {
            middleware: [
              offset(FORMATTING_TOOLBAR_FLOATING_CONFIG.offsetFromSelection),
              shift({
                boundary: boundaryElement ?? undefined,
                padding: FORMATTING_TOOLBAR_FLOATING_CONFIG.boundaryPadding,
              }),
              flip({
                boundary: boundaryElement ?? undefined,
              }),
            ],
          },
        }}
      />
    </StyledToolbarContainer>
  );
};
