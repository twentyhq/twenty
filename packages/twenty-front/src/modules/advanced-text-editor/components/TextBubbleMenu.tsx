import { BubbleMenuIconButton } from '@/advanced-text-editor/components/BubbleMenuIconButton';
import { EditLinkPopover } from '@/advanced-text-editor/components/EditLinkPopover';
import { TurnIntoBlockDropdown } from '@/advanced-text-editor/components/TurnIntoBlockDropdown';
import { useTextBubbleState } from '@/advanced-text-editor/hooks/useTextBubbleState';
import { isTextSelected } from '@/advanced-text-editor/utils/isTextSelected';
import styled from '@emotion/styled';
import { type Editor } from '@tiptap/core';
import { BubbleMenu } from '@tiptap/react/menus';
import {
  IconBold,
  IconItalic,
  IconList,
  IconListNumbers,
  IconStrikethrough,
  IconUnderline,
} from 'twenty-ui/display';

export const StyledBubbleMenuContainer = styled.div`
  backdrop-filter: blur(20px);
  background-color: ${({ theme }) => theme.background.primary};
  border-radius: ${({ theme }) => theme.border.radius.md};
  box-shadow: ${({ theme }) =>
    `0px 2px 4px 0px ${theme.background.transparent.light}, 0px 0px 4px 0px ${theme.background.transparent.medium}`};
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
      onClick: () => editor.chain().focus().toggleBold().run(),
      isActive: state.isBold,
    },
    {
      Icon: IconItalic,
      onClick: () => editor.chain().focus().toggleItalic().run(),
      isActive: state.isItalic,
    },
    {
      Icon: IconUnderline,
      onClick: () => editor.chain().focus().toggleUnderline().run(),
      isActive: state.isUnderline,
    },
    {
      Icon: IconStrikethrough,
      onClick: () => editor.chain().focus().toggleStrike().run(),
      isActive: state.isStrike,
    },
    {
      Icon: IconList,
      onClick: () => editor.chain().focus().wrapInList('bulletList').run(),
      isActive: state.isBulletList,
    },
    {
      Icon: IconListNumbers,
      onClick: () => editor.chain().focus().wrapInList('orderedList').run(),
      isActive: state.isOrderedList,
    },
  ];

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
        <TurnIntoBlockDropdown editor={editor} />
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
        <EditLinkPopover defaultValue={state.linkHref} editor={editor} />
      </StyledBubbleMenuContainer>
    </BubbleMenu>
  );
};
