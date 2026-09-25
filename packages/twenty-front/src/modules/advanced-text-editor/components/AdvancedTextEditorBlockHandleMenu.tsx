import { isAdvancedTextEditorBlockNodeType } from '@/advanced-text-editor/types/AdvancedTextEditorBlockCatalog';
import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { DropdownRoot } from '@/ui/layout/dropdown/components/DropdownRoot';
import { GenericDropdownContentWidth } from '@/ui/layout/dropdown/constants/GenericDropdownContentWidth';
import { useLingui } from '@lingui/react/macro';
import { type Editor } from '@tiptap/core';
import { type Node as ProseMirrorNode } from '@tiptap/pm/model';
import { type PointerEvent as ReactPointerEvent, useId } from 'react';
import { isDefined, TIPTAP_NODE_TYPES } from 'twenty-shared/utils';
import { Dropdown, LightIconButton } from 'twenty-ui/components';
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
  onPointerDown: (event: ReactPointerEvent<HTMLElement>) => void;
  onOpenChange: (isOpen: boolean) => void;
  onOpenBlockSettings?: () => void;
};

export const AdvancedTextEditorBlockHandleMenu = ({
  editor,
  blockPos,
  onPointerDown,
  onOpenChange,
  onOpenBlockSettings,
}: AdvancedTextEditorBlockHandleMenuProps) => {
  const { t } = useLingui();
  const instanceId = useId();
  const blockNode = editor.state.doc.nodeAt(blockPos);

  const hasBlockSettings =
    isDefined(onOpenBlockSettings) &&
    isDefined(blockNode) &&
    isAdvancedTextEditorBlockNodeType(blockNode.type.name);

  const runOnBlock = (action: (node: ProseMirrorNode) => void) => {
    const node = editor.state.doc.nodeAt(blockPos);

    if (isDefined(node)) {
      action(node);
    }
  };

  const handleAddBlock = () =>
    runOnBlock((node) => {
      const insertionPos = blockPos + node.nodeSize;

      editor
        .chain()
        .insertContentAt(insertionPos, { type: TIPTAP_NODE_TYPES.PARAGRAPH })
        .setTextSelection(insertionPos + 1)
        .insertContent('/')
        .focus(null, { scrollIntoView: false })
        .run();
    });

  const handleDuplicate = () =>
    runOnBlock((node) => {
      editor
        .chain()
        .insertContentAt(blockPos + node.nodeSize, node.toJSON())
        .run();
    });

  const handleOpenBlockSettings = () => {
    editor.chain().setNodeSelection(blockPos).run();
    onOpenBlockSettings?.();
  };

  const handleDelete = () =>
    runOnBlock((node) => {
      editor
        .chain()
        .command(({ tr }) => {
          tr.delete(blockPos, blockPos + node.nodeSize);
          return true;
        })
        .run();
    });

  return (
    <DropdownRoot
      dropdownId={`advanced-text-editor-block-handle-${instanceId}`}
      type="menu"
      onOpenChange={onOpenChange}
    >
      <Dropdown.Trigger
        onPointerDown={onPointerDown}
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
              {t`Design`}
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
