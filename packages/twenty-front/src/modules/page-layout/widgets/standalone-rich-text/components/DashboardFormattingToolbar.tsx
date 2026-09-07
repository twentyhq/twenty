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
import { styled } from '@linaria/react';

const StyledToolbarContainer = styled.div`
  max-width: calc(
    100vw - ${FORMATTING_TOOLBAR_FLOATING_CONFIG.boundaryPadding * 2}px
  );

  & .bn-formatting-toolbar.bn-toolbar {
    box-sizing: border-box;
    flex-wrap: wrap;
    max-width: 100%;
    overflow: visible;
  }

  & .bn-formatting-toolbar .mantine-Button-root {
    height: 24px;
    min-height: 24px;
  }
`;

export const DashboardFormattingToolbar = () => {
  return (
    <FormattingToolbarController
      formattingToolbar={() => (
        <StyledToolbarContainer>
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
        </StyledToolbarContainer>
      )}
      floatingUIOptions={{
        useFloatingOptions: {
          middleware: [
            offset(FORMATTING_TOOLBAR_FLOATING_CONFIG.offsetFromSelection),
            shift({
              padding: FORMATTING_TOOLBAR_FLOATING_CONFIG.boundaryPadding,
            }),
            flip(),
          ],
        },
      }}
    />
  );
};
