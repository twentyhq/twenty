import { type DefaultProps } from '@blocknote/core';
import {
  BasicTextStyleButton,
  BlockTypeSelect,
  CreateLinkButton,
  FormattingToolbar,
  NestBlockButton,
  TextAlignButton,
  UnnestBlockButton,
  useBlockNoteEditor,
  useEditorContentOrSelectionChange,
  useUIElementPositioning,
  useUIPluginState,
} from '@blocknote/react';
import { useTheme } from '@emotion/react';
import { flip, FloatingPortal, offset, shift } from '@floating-ui/react';
import { useMemo, useRef, useState } from 'react';
import { isDefined } from 'twenty-shared/utils';

import { DashboardFormattingToolbarColorButton } from '@/page-layout/widgets/standalone-rich-text/components/DashboardFormattingToolbarColorButton';
import { FORMATTING_TOOLBAR_FLOATING_CONFIG } from '@/page-layout/widgets/standalone-rich-text/constants/FormattingToolbarFloatingConfig';
import styled from '@emotion/styled';

const StyledToolbarContainer = styled.div`
  & .bn-formatting-toolbar .mantine-Button-root {
    height: 24px;
    min-height: 24px;
  }
`;

const textAlignmentToPlacement = (
  textAlignment: DefaultProps['textAlignment'],
) => {
  switch (textAlignment) {
    case 'left':
      return 'top-start';
    case 'center':
      return 'top';
    case 'right':
      return 'top-end';
    default:
      return 'top-start';
  }
};

type DashboardFormattingToolbarProps = {
  boundaryElement?: HTMLElement | null;
};

// This is a copy of the BlockNote's FormattingToolbarController component with customizations.
export const DashboardFormattingToolbar = ({
  boundaryElement,
}: DashboardFormattingToolbarProps) => {
  // eslint-disable-next-line @nx/workspace-no-state-useref
  const toolbarContainerRef = useRef<HTMLDivElement | null>(null);
  const editor = useBlockNoteEditor();
  const theme = useTheme();
  const colorScheme = theme.name === 'light' ? 'light' : 'dark';

  const [placement, setPlacement] = useState<'top-start' | 'top' | 'top-end'>(
    () => {
      const block = editor.getTextCursorPosition().block;

      if (!('textAlignment' in block.props)) {
        return 'top-start';
      }

      return textAlignmentToPlacement(
        block.props.textAlignment as DefaultProps['textAlignment'],
      );
    },
  );

  useEditorContentOrSelectionChange(() => {
    const block = editor.getTextCursorPosition().block;

    if (!('textAlignment' in block.props)) {
      setPlacement('top-start');
    } else {
      setPlacement(
        textAlignmentToPlacement(
          block.props.textAlignment as DefaultProps['textAlignment'],
        ),
      );
    }
  }, editor);

  const state = useUIPluginState(
    editor.formattingToolbar.onUpdate.bind(editor.formattingToolbar),
  );

  const isNodeSelection =
    editor.prosemirrorView?.state.selection.toJSON().type === 'node';

  const shouldShow = (state?.show && !isNodeSelection) || false;

  const { isMounted, ref, style, getFloatingProps } = useUIElementPositioning(
    shouldShow,
    state?.referencePos || null,
    3000,
    {
      placement,
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
      onOpenChange: (open) => {
        if (!open) {
          editor.formattingToolbar.closeMenu();
          editor.focus();
        }
      },
    },
  );

  const combinedRef = useMemo(
    () => (node: HTMLDivElement | null) => {
      toolbarContainerRef.current = node;
      if (typeof ref === 'function') {
        ref(node);
      }
    },
    [ref],
  );

  if (!isMounted || !isDefined(state)) {
    return null;
  }

  if (!shouldShow && isDefined(toolbarContainerRef.current)) {
    return (
      <FloatingPortal>
        <StyledToolbarContainer
          className="bn-container bn-mantine bn-ui-container"
          data-color-scheme={colorScheme}
          data-mantine-color-scheme={colorScheme}
          ref={combinedRef}
          style={style}
          dangerouslySetInnerHTML={{
            __html: toolbarContainerRef.current.innerHTML,
          }}
        />
      </FloatingPortal>
    );
  }

  return (
    <FloatingPortal>
      <StyledToolbarContainer
        className="bn-container bn-mantine bn-ui-container"
        data-color-scheme={colorScheme}
        data-mantine-color-scheme={colorScheme}
        ref={combinedRef}
        style={style}
        // eslint-disable-next-line react/jsx-props-no-spreading
        {...getFloatingProps()}
      >
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
          <TextAlignButton textAlignment="center" key="textAlignCenterButton" />
          <TextAlignButton textAlignment="right" key="textAlignRightButton" />
          <DashboardFormattingToolbarColorButton key="colorStyleButton" />
          <NestBlockButton key="nestBlockButton" />
          <UnnestBlockButton key="unnestBlockButton" />
          <CreateLinkButton key="createLinkButton" />
        </FormattingToolbar>
      </StyledToolbarContainer>
    </FloatingPortal>
  );
};
