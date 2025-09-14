import { BubbleMenuIconButton } from '@/workflow/workflow-steps/workflow-actions/email-action/components/text-bubble-menu/BubbleMenuIconButton';
import { EditLinkPopover } from '@/workflow/workflow-steps/workflow-actions/email-action/components/text-bubble-menu/EditLinkPopover';
import { StyledBubbleMenuContainer } from '@/workflow/workflow-steps/workflow-actions/email-action/components/text-bubble-menu/TextBubbleMenu';
import { type Editor } from '@tiptap/core';
import { useEditorState } from '@tiptap/react';
import { BubbleMenu } from '@tiptap/react/menus';
import { IconExternalLink, IconLinkOff } from 'twenty-ui/display';

type LinkBubbleMenuProps = {
  editor: Editor;
};

export const LinkBubbleMenu = ({ editor }: LinkBubbleMenuProps) => {
  const state = useEditorState({
    editor,
    selector: (ctx) => {
      return {
        linkHref: ctx.editor.getAttributes('link').href,
      };
    },
  });

  const handleShouldShow = () => {
    return editor.isActive('link');
  };

  const menuActions = [
    {
      Icon: IconExternalLink,
      onClick: () => {
        window.open(state.linkHref, '_blank');
      },
    },
    {
      Icon: IconLinkOff,
      onClick: () =>
        editor.chain().focus().extendMarkRange('link').unsetLink().run(),
    },
  ];

  return (
    <BubbleMenu
      pluginKey="link-bubble-menu"
      editor={editor}
      shouldShow={handleShouldShow}
    >
      <StyledBubbleMenuContainer>
        <EditLinkPopover defaultValue={state.linkHref} editor={editor} />
        {menuActions.map(({ Icon, onClick }, index) => {
          return (
            <BubbleMenuIconButton
              key={`bubble-menu-icon-button-${index}`}
              Icon={Icon}
              onClick={onClick}
              size="medium"
            />
          );
        })}
      </StyledBubbleMenuContainer>
    </BubbleMenu>
  );
};
