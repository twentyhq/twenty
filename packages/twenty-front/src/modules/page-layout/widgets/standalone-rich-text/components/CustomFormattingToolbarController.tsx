import { type DefaultProps } from '@blocknote/core';
import {
  FormattingToolbar,
  useBlockNoteEditor,
  useEditorContentOrSelectionChange,
  useUIElementPositioning,
  useUIPluginState,
} from '@blocknote/react';
import { flip, offset, shift } from '@floating-ui/react';
import { useMemo, useRef, useState } from 'react';
import { isDefined } from 'twenty-shared/utils';

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

// This is a copy of the BlockNote's FormattingToolbarController component with a custom check to prevent toolbar from showing when a block is selected via drag handle (NodeSelection)
export const CustomFormattingToolbarController = () => {
  // eslint-disable-next-line @nx/workspace-no-state-useref -- This ref holds a DOM element reference for innerHTML access during fade-out, not state
  const divRef = useRef<HTMLDivElement | null>(null);
  const editor = useBlockNoteEditor();

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

  // Custom check: don't show toolbar for NodeSelection (drag handle click)
  const isNodeSelection =
    editor.prosemirrorView?.state.selection.toJSON().type === 'node';

  const shouldShow = (state?.show && !isNodeSelection) || false;

  const { isMounted, ref, style, getFloatingProps } = useUIElementPositioning(
    shouldShow,
    state?.referencePos || null,
    3000,
    {
      placement,
      middleware: [offset(10), shift(), flip()],
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
      divRef.current = node;
      if (typeof ref === 'function') {
        ref(node);
      }
    },
    [ref],
  );

  if (!isMounted || !state) {
    return null;
  }

  if (!shouldShow && isDefined(divRef.current)) {
    return (
      <div
        ref={combinedRef}
        style={style}
        dangerouslySetInnerHTML={{ __html: divRef.current.innerHTML }}
      />
    );
  }

  return (
    // eslint-disable-next-line react/jsx-props-no-spreading -- We need to spread the props from the floating props
    <div ref={combinedRef} style={style} {...getFloatingProps()}>
      <FormattingToolbar />
    </div>
  );
};
