import { t } from '@lingui/core/macro';
import { isNonEmptyArray } from '@sniptt/guards';
import { Fragment, type ReactNode } from 'react';
import { StyledBubbleMenuContainer } from '@/advanced-text-editor/components/StyledBubbleMenuContainer';
import { BubbleMenuIconButton } from '@/advanced-text-editor/components/BubbleMenuIconButton';
import { BubbleMenuSeparator } from '@/advanced-text-editor/components/BubbleMenuSeparator';
import { EditLinkDropdown } from '@/advanced-text-editor/components/EditLinkDropdown';
import { TurnIntoBlockDropdown } from '@/advanced-text-editor/components/TurnIntoBlockDropdown';
import { useTextBubbleState } from '@/advanced-text-editor/hooks/useTextBubbleState';
import { hasEditorExtension } from '@/advanced-text-editor/utils/hasEditorExtension';
import { isTextSelected } from '@/advanced-text-editor/utils/isTextSelected';
import { getEditLinkDropdownId } from '@/advanced-text-editor/utils/getEditLinkDropdownId';
import { type Editor } from '@tiptap/core';
import { NodeSelection } from '@tiptap/pm/state';
import { BubbleMenu } from '@tiptap/react/menus';
import {
  IconBold,
  IconItalic,
  IconList,
  IconListNumbers,
  IconStrikethrough,
  IconUnderline,
} from 'twenty-ui/icon';

type TextBubbleMenuProps = {
  editor: Editor;
};

export const TextBubbleMenu = ({ editor }: TextBubbleMenuProps) => {
  const state = useTextBubbleState(editor);
  const menuActions = [
    {
      Icon: IconBold,
      label: t`Bold`,
      extensionName: 'bold',
      group: 'format',
      onClick: () => editor.chain().focus().toggleBold().run(),
      isActive: state.isBold,
    },
    {
      Icon: IconItalic,
      label: t`Italic`,
      extensionName: 'italic',
      group: 'format',
      onClick: () => editor.chain().focus().toggleItalic().run(),
      isActive: state.isItalic,
    },
    {
      Icon: IconUnderline,
      label: t`Underline`,
      extensionName: 'underline',
      group: 'format',
      onClick: () => editor.chain().focus().toggleUnderline().run(),
      isActive: state.isUnderline,
    },
    {
      Icon: IconStrikethrough,
      label: t`Strikethrough`,
      extensionName: 'strike',
      group: 'format',
      onClick: () => editor.chain().focus().toggleStrike().run(),
      isActive: state.isStrike,
    },
    {
      Icon: IconList,
      label: t`Bullet list`,
      extensionName: 'bulletList',
      group: 'list',
      onClick: () => editor.chain().focus().wrapInList('bulletList').run(),
      isActive: state.isBulletList,
    },
    {
      Icon: IconListNumbers,
      label: t`Numbered list`,
      extensionName: 'orderedList',
      group: 'list',
      onClick: () => editor.chain().focus().wrapInList('orderedList').run(),
      isActive: state.isOrderedList,
    },
  ].filter(({ extensionName }) => hasEditorExtension(editor, extensionName));

  const renderActions = (group: string) =>
    menuActions
      .filter((action) => action.group === group)
      .map(({ label, Icon, onClick, isActive }) => (
        <BubbleMenuIconButton
          key={Icon.name || Icon.displayName || 'unknown'}
          label={label}
          Icon={Icon}
          onClick={onClick}
          isActive={isActive}
        />
      ));

  const menuGroups: ReactNode[][] = [
    hasEditorExtension(editor, 'heading')
      ? [<TurnIntoBlockDropdown key="turn-into" editor={editor} />]
      : [],
    renderActions('format'),
    renderActions('list'),
    hasEditorExtension(editor, 'link')
      ? [
          <EditLinkDropdown
            key="link"
            dropdownId={getEditLinkDropdownId({
              editorInstanceId: editor.instanceId,
              bubbleMenuType: 'text',
            })}
            defaultValue={state.linkHref}
            editor={editor}
          />,
        ]
      : [],
  ].filter(isNonEmptyArray);

  const handleShouldShow = () => {
    if (editor.isActive('image')) {
      return false;
    }

    const { selection } = editor.state;
    if (selection instanceof NodeSelection && selection.node.isAtom) {
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
        {menuGroups.map((menuGroup, index) => (
          <Fragment key={index}>
            {index > 0 && <BubbleMenuSeparator />}
            {menuGroup}
          </Fragment>
        ))}
      </StyledBubbleMenuContainer>
    </BubbleMenu>
  );
};
