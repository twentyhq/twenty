import { filterSuggestionItems } from '@blocknote/core/extensions';
import { BlockNoteView } from '@blocknote/mantine';
import { SuggestionMenuController } from '@blocknote/react';
import { styled } from '@linaria/react';
import { type ClipboardEvent, useContext } from 'react';

import {
  CustomSlashMenu,
  type SuggestionItem,
} from '@/blocknote-editor/components/CustomSlashMenu';
import { DashboardEditorSideMenu } from '@/page-layout/widgets/standalone-rich-text/components/DashboardEditorSideMenu';
import { DashboardFormattingToolbar } from '@/page-layout/widgets/standalone-rich-text/components/DashboardFormattingToolbar';
import { type DASHBOARD_BLOCK_SCHEMA } from '@/page-layout/widgets/standalone-rich-text/constants/DashboardBlockSchema';
import { getDashboardSlashMenu } from '@/page-layout/widgets/standalone-rich-text/utils/getDashboardSlashMenu';
import { ThemeContext, themeCssVariables } from 'twenty-ui/theme-constants';
type DashboardsBlockEditorProps = {
  editor: typeof DASHBOARD_BLOCK_SCHEMA.BlockNoteEditor;
  onFocus?: () => void;
  onBlur?: () => void;
  onPaste?: (event: ClipboardEvent) => void;
  onChange?: () => void;
  readonly?: boolean;
  boundaryElement?: HTMLElement | null;
};

// TODO: Refactor these BlockNote CSS overrides - some may be dead code now that we have custom components
// (DashboardEditorSideMenu, DashboardColorSelectionMenu).
// Test removing each selector and move necessary styles to appropriate components.
// oxlint-disable-next-line twenty/no-hardcoded-colors
const StyledEditor = styled.div`
  width: 100%;

  & .editor {
    background: transparent;
    color: ${themeCssVariables.font.color.primary};
    font-size: 13px;
    user-select: text;
  }
  & .editor [class^='_inlineContent']:before {
    color: ${themeCssVariables.font.color.tertiary};
    font-style: normal !important;
  }
  & .editor .bn-inline-content:has(> .ProseMirror-trailingBreak):before {
    font-style: normal;
  }
  & .mantine-ActionIcon-icon {
    background: transparent;
    height: 20px;
    width: 20px;
  }
  & .bn-container .bn-drag-handle {
    height: 20px;
    width: 20px;
  }
  & .bn-block-outer {
    line-height: 1.4;
  }
  & .bn-block-content[data-content-type='checkListItem'] > div > div {
    align-items: center;
    display: flex;
  }
  & .bn-drag-handle-menu {
    backdrop-filter: ${themeCssVariables.blur.medium};
    background: ${themeCssVariables.background.transparent.secondary};
    border: 1px solid ${themeCssVariables.border.color.medium};
    border-radius: 8px;
    box-shadow:
      0px 2px 4px rgba(0, 0, 0, 0.04),
      2px 4px 16px rgba(0, 0, 0, 0.12);
    min-height: 96px;
    min-width: 160px;
    padding: 4px;
  }

  & .bn-editor {
    padding-inline: 0px;
  }

  & .bn-inline-content {
    width: 100%;
  }

  & .bn-container .bn-suggestion-menu-item:hover {
    background-color: blue;
  }

  & .bn-suggestion-menu {
    backdrop-filter: ${themeCssVariables.blur.medium};
    background: ${themeCssVariables.background.transparent.secondary};
    border: 1px solid ${themeCssVariables.border.color.medium};
    border-radius: 8px;
    padding: 4px;
  }

  & .mantine-Menu-item {
    background-color: transparent;
    color: ${themeCssVariables.font.color.secondary};
    font-family: ${themeCssVariables.font.family};

    font-style: normal;
    font-weight: ${themeCssVariables.font.weight.regular};
    min-height: 32px;
    min-width: 152px;
  }
  & .mantine-ActionIcon-root:hover {
    backdrop-filter: blur(20px);
    background: ${themeCssVariables.background.transparent.primary};
    border: 1px solid ${themeCssVariables.border.color.light};
    box-shadow:
      0px 0px 4px rgba(0, 0, 0, 0.08),
      0px 2px 4px rgba(0, 0, 0, 0.04);
  }
  & .bn-side-menu .mantine-UnstyledButton-root:not(.mantine-Menu-item) svg {
    height: 16px;
    width: 16px;
  }

  & .bn-mantine .bn-side-menu > [draggable='true'] {
    margin-bottom: 5px;
  }
  & .bn-color-picker-dropdown {
    margin-left: 8px;
  }

  & .bn-inline-content a {
    color: ${themeCssVariables.color.blue};
  }

  & .bn-inline-content code {
    background-color: ${themeCssVariables.background.transparent.light};
    border: 1px solid ${themeCssVariables.font.color.extraLight};
    border-radius: 4px;
    color: ${themeCssVariables.font.color.danger};
    font-family: monospace;
    font-size: 0.9rem;
    padding: 2px 4px;
  }
`;

export const DashboardsBlockEditor = ({
  editor,
  onFocus,
  onBlur,
  onChange,
  onPaste,
  readonly,
  boundaryElement,
}: DashboardsBlockEditorProps) => {
  const { colorScheme } = useContext(ThemeContext);
  const blockNoteTheme = colorScheme === 'light' ? 'light' : 'dark';

  const handleFocus = () => {
    onFocus?.();
  };

  const handleBlur = () => {
    onBlur?.();
  };

  const handleChange = () => {
    onChange?.();
  };

  const handlePaste = (event: ClipboardEvent) => {
    onPaste?.(event);
  };

  return (
    <StyledEditor>
      <BlockNoteView
        onFocus={handleFocus}
        onBlur={handleBlur}
        onPaste={handlePaste}
        onChange={handleChange}
        editor={editor}
        theme={blockNoteTheme}
        slashMenu={false}
        sideMenu={false}
        formattingToolbar={false}
        editable={!readonly}
      >
        {!readonly && (
          <>
            <DashboardFormattingToolbar boundaryElement={boundaryElement} />
            <DashboardEditorSideMenu editor={editor} />
            <SuggestionMenuController
              triggerCharacter="/"
              getItems={async (query) => {
                const items = getDashboardSlashMenu(editor);
                return filterSuggestionItems<SuggestionItem>(items, query);
              }}
              suggestionMenuComponent={CustomSlashMenu}
            />
          </>
        )}
      </BlockNoteView>
    </StyledEditor>
  );
};
