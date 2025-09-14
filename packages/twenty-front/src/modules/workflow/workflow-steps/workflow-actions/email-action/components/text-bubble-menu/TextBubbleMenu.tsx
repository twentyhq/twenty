import { BubbleMenuIconButton } from '@/workflow/workflow-steps/workflow-actions/email-action/components/text-bubble-menu/BubbleMenuIconButton';
import { EditLinkPopover } from '@/workflow/workflow-steps/workflow-actions/email-action/components/text-bubble-menu/EditLinkPopover';
import { TurnIntoBlockDropdown } from '@/workflow/workflow-steps/workflow-actions/email-action/components/text-bubble-menu/TurnIntoBlockDropdown';
import { useTextBubbleState } from '@/workflow/workflow-steps/workflow-actions/email-action/hooks/useTextBubbleState';
import { isTextSelected } from '@/workflow/workflow-steps/workflow-actions/email-action/utils/isTextSelected';
import styled from '@emotion/styled';
import { type Editor } from '@tiptap/core';
import { BubbleMenu } from '@tiptap/react/menus';
import {
  IconBold,
  IconItalic,
  IconStrikethrough,
  IconUnderline,
} from 'twenty-ui/display';

export const StyledBubbleMenuContainer = styled.div`
  backdrop-filter: blur(20px);
  background-color: ${({ theme }) => theme.background.primary};
  border-radius: ${({ theme }) => theme.border.radius.sm};
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
  ];

  const handleShouldShow = () => {
    return isTextSelected({ editor });
  };

  return (
    <BubbleMenu
      pluginKey="text-bubble-menu"
      editor={editor}
      shouldShow={handleShouldShow}
    >
      <StyledBubbleMenuContainer>
        <TurnIntoBlockDropdown editor={editor} />
        {menuActions.map(({ Icon, onClick, isActive }, index) => {
          return (
            <BubbleMenuIconButton
              key={`bubble-menu-icon-button-${index}`}
              Icon={Icon}
              onClick={onClick}
              isActive={isActive}
              size="medium"
            />
          );
        })}
        <EditLinkPopover defaultValue={state.linkHref} editor={editor} />
      </StyledBubbleMenuContainer>
    </BubbleMenu>
  );
};
