import { BubbleMenuIconButton } from '@/advanced-text-editor/components/BubbleMenuIconButton';
import { EditLinkPopover } from '@/advanced-text-editor/components/EditLinkPopover';
import { TurnIntoBlockDropdown } from '@/advanced-text-editor/components/TurnIntoBlockDropdown';
import { useTextBubbleState } from '@/advanced-text-editor/hooks/useTextBubbleState';
import { hasEditorExtension } from '@/advanced-text-editor/utils/hasEditorExtension';
import { isTextSelected } from '@/advanced-text-editor/utils/isTextSelected';
import { styled } from '@linaria/react';
import { type Editor } from '@tiptap/core';
import { BubbleMenu } from '@tiptap/react/menus';
import {
  IconBold,
  IconItalic,
  IconList,
  IconListNumbers,
  IconStrikethrough,
  IconUnderline,
} from 'twenty-ui/icon';
import { themeCssVariables } from 'twenty-ui/theme-constants';

export const StyledBubbleMenuContainer = styled.div`
  backdrop-filter: blur(20px);
  background-color: ${themeCssVariables.background.primary};
  border-radius: ${themeCssVariables.border.radius.md};
  box-shadow:
    0px 2px 4px 0px ${themeCssVariables.background.transparent.light},
    0px 0px 4px 0px ${themeCssVariables.background.transparent.medium};
  display: inline-flex;
  gap: 2px;
  padding: 2px;
`;

type TextBubbleMenuProps = {
  editor: Editor;
};

export const TextBubbleMenu = ({ editor }: TextBubbleMenuProps) => {
  const state = useTextBubbleState(editor);
  const menuActions = [
    {
      Icon: IconBold,
      extensionName: 'bold',
      onClick: () => editor.chain().focus().toggleBold().run(),
      isActive: state.isBold,
    },
    {
      Icon: IconItalic,
      extensionName: 'italic',
      onClick: () => editor.chain().focus().toggleItalic().run(),
      isActive: state.isItalic,
    },
    {
      Icon: IconUnderline,
      extensionName: 'underline',
      onClick: () => editor.chain().focus().toggleUnderline().run(),
      isActive: state.isUnderline,
    },
    {
      Icon: IconStrikethrough,
      extensionName: 'strike',
      onClick: () => editor.chain().focus().toggleStrike().run(),
      isActive: state.isStrike,
    },
    {
      Icon: IconList,
      extensionName: 'bulletList',
      onClick: () => editor.chain().focus().wrapInList('bulletList').run(),
      isActive: state.isBulletList,
    },
    {
      Icon: IconListNumbers,
      extensionName: 'orderedList',
      onClick: () => editor.chain().focus().wrapInList('orderedList').run(),
      isActive: state.isOrderedList,
    },
  ].filter(({ extensionName }) => hasEditorExtension(editor, extensionName));

  const handleShouldShow = () => {
    if (editor.isActive('image')) {
      return false;
    }

    return isTextSelected({ editor });
  };

  return (
    <BubbleMenu
      pluginKey="text-bubble-menu"
      editor={editor}
      shouldShow={handleShouldShow}
      updateDelay={0}
    >
      <StyledBubbleMenuContainer>
        {hasEditorExtension(editor, 'heading') && (
          <TurnIntoBlockDropdown editor={editor} />
        )}
        {menuActions.map(({ Icon, onClick, isActive }) => {
          return (
            <BubbleMenuIconButton
              key={Icon.name || Icon.displayName || 'unknown'}
              Icon={Icon}
              onClick={onClick}
              isActive={isActive}
            />
          );
        })}
        {hasEditorExtension(editor, 'link') && (
          <EditLinkPopover defaultValue={state.linkHref} editor={editor} />
        )}
      </StyledBubbleMenuContainer>
    </BubbleMenu>
  );
};
