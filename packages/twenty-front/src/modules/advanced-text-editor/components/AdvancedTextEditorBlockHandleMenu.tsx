import { isAdvancedTextEditorBlockNodeType } from '@/advanced-text-editor/types/AdvancedTextEditorBlockCatalog';
import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { DropdownRoot } from '@/ui/layout/dropdown/components/DropdownRoot';
import { GenericDropdownContentWidth } from '@/ui/layout/dropdown/constants/GenericDropdownContentWidth';
import { useLingui } from '@lingui/react/macro';
import { type Editor } from '@tiptap/core';
import { useId } from 'react';
import { isDefined, TIPTAP_NODE_TYPES } from 'twenty-shared/utils';
import { LightIconButton } from 'twenty-ui/components/input';
import { Dropdown } from 'twenty-ui/components/navigation';
import {
  IconAdjustments,
  IconCopy,
  IconGripVertical,
  IconPlus,
  IconTrash,
} from 'twenty-ui/icon';

type AdvancedTextEditorBlockHandleMenuProps = {
  editor: Editor;
  blockPos: number;
  onOpenChange: (isOpen: boolean) => void;
  onOpenBlockSettings?: () => void;
};

export const AdvancedTextEditorBlockHandleMenu = ({
  editor,
  blockPos,
  onOpenChange,
  onOpenBlockSettings,
}: AdvancedTextEditorBlockHandleMenuProps) => {
  const { t } = useLingui();
  const instanceId = useId();
  const blockNode = editor.state.doc.nodeAt(blockPos);

  if (!isDefined(blockNode)) {
    return null;
  }

  const blockEnd = blockPos + blockNode.nodeSize;
  const hasBlockSettings =
    isDefined(onOpenBlockSettings) &&
    isAdvancedTextEditorBlockNodeType(blockNode.type.name);

  const handleAddBlock = () =>
    editor
      .chain()
      .insertContentAt(blockEnd, { type: TIPTAP_NODE_TYPES.PARAGRAPH })
      .setTextSelection(blockEnd + 1)
      .insertContent('/')
      .focus(null, { scrollIntoView: false })
      .run();

  const handleDuplicate = () =>
    editor.chain().insertContentAt(blockEnd, blockNode.toJSON()).run();

  const handleOpenBlockSettings = () => {
    editor.chain().setNodeSelection(blockPos).run();
    onOpenBlockSettings?.();
  };

  const handleDelete = () =>
    editor.chain().deleteRange({ from: blockPos, to: blockEnd }).run();

  return (
    <DropdownRoot
      dropdownId={`advanced-text-editor-block-handle-${instanceId}`}
      type="menu"
      onOpenChange={onOpenChange}
    >
      <Dropdown.Trigger
        render={
          <LightIconButton
            size="sm"
            emphasis="subtle"
            aria-label={t`Drag to move, click for options`}
          >
            <IconGripVertical />
          </LightIconButton>
        }
      />
      <DropdownContent
        side="bottom"
        align="start"
        width={GenericDropdownContentWidth.Narrow}
      >
        <Dropdown.Section>
          <Dropdown.ActionItem
            startIcon={<IconPlus />}
            onClick={handleAddBlock}
          >
            {t`Add block`}
          </Dropdown.ActionItem>
          <Dropdown.ActionItem
            startIcon={<IconCopy />}
            onClick={handleDuplicate}
          >
            {t`Duplicate`}
          </Dropdown.ActionItem>
          {hasBlockSettings && (
            <Dropdown.ActionItem
              startIcon={<IconAdjustments />}
              onClick={handleOpenBlockSettings}
            >
              {t`Style`}
            </Dropdown.ActionItem>
          )}
          <Dropdown.ActionItem
            color="danger"
            startIcon={<IconTrash />}
            onClick={handleDelete}
          >
            {t`Delete`}
          </Dropdown.ActionItem>
        </Dropdown.Section>
      </DropdownContent>
    </DropdownRoot>
  );
};
