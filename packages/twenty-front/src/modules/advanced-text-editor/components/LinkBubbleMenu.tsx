import { BubbleMenuIconButton } from '@/advanced-text-editor/components/BubbleMenuIconButton';
import { EditLinkPopover } from '@/advanced-text-editor/components/EditLinkPopover';
import { StyledBubbleMenuContainer } from '@/advanced-text-editor/components/TextBubbleMenu';
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
        linkHref: ctx.editor.getAttributes('link').href || '',
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
      updateDelay={0}
    >
      <StyledBubbleMenuContainer>
        <EditLinkPopover defaultValue={state.linkHref} editor={editor} />
        {menuActions.map(({ Icon, onClick }) => {
          return (
            <BubbleMenuIconButton
              key={Icon.name || Icon.displayName || 'unknown'}
              Icon={Icon}
              onClick={onClick}
            />
          );
        })}
      </StyledBubbleMenuContainer>
    </BubbleMenu>
  );
};
