import { t } from '@lingui/core/macro';
import { BubbleMenuIconButton } from '@/advanced-text-editor/components/BubbleMenuIconButton';
import { EditLinkDropdown } from '@/advanced-text-editor/components/EditLinkDropdown';
import { StyledBubbleMenuContainer } from '@/advanced-text-editor/components/StyledBubbleMenuContainer';
import { useLiveEditorState } from '@/advanced-text-editor/hooks/useLiveEditorState';
import { getEditLinkDropdownId } from '@/advanced-text-editor/utils/getEditLinkDropdownId';
import { type Editor } from '@tiptap/core';
import { BubbleMenu } from '@tiptap/react/menus';
import { IconExternalLink, IconLinkOff } from 'twenty-ui/icon';
import { getSafeUrl } from 'twenty-shared/utils';

type LinkBubbleMenuProps = {
  editor: Editor;
};

export const LinkBubbleMenu = ({ editor }: LinkBubbleMenuProps) => {
  const state = useLiveEditorState(editor, (currentEditor) => {
    return {
      linkHref: currentEditor.getAttributes('link').href || '',
    };
  });

  const handleShouldShow = () => {
    return editor.isActive('link');
  };

  const menuActions = [
    {
      Icon: IconExternalLink,
      label: t`Open link`,
      onClick: () => {
        const safeHref = getSafeUrl(state.linkHref);

        if (safeHref) {
          window.open(safeHref, '_blank', 'noopener,noreferrer');
        }
      },
    },
    {
      Icon: IconLinkOff,
      label: t`Remove link`,
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
        <EditLinkDropdown
          dropdownId={getEditLinkDropdownId({
            editorInstanceId: editor.instanceId,
            bubbleMenuType: 'link',
          })}
          defaultValue={state.linkHref}
          editor={editor}
        />
        {menuActions.map(({ label, Icon, onClick }) => {
          return (
            <BubbleMenuIconButton
              key={Icon.name || Icon.displayName || 'unknown'}
              label={label}
              Icon={Icon}
              onClick={onClick}
            />
          );
        })}
      </StyledBubbleMenuContainer>
    </BubbleMenu>
  );
};
