import { useTurnIntoBlockOptions } from '@/advanced-text-editor/hooks/useTurnIntoBlockOptions';
import { isAdvancedTextEditorBlockNodeType } from '@/advanced-text-editor/types/AdvancedTextEditorBlockCatalog';
import { getTurnIntoSelection } from '@/advanced-text-editor/utils/getTurnIntoSelection';
import { SelectOptionIcon } from '@/ui/input/components/SelectOptionIcon';
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
  IconTransform,
  IconTrash,
} from 'twenty-ui/icon';
import { useTheme } from 'twenty-ui/theme';

const TURN_INTO_NODE_TYPES: string[] = [
  TIPTAP_NODE_TYPES.PARAGRAPH,
  TIPTAP_NODE_TYPES.HEADING,
  TIPTAP_NODE_TYPES.BLOCKQUOTE,
];

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
  const theme = useTheme();
  const instanceId = useId();
  const turnIntoOptions = useTurnIntoBlockOptions(editor);
  const blockNode =
    blockPos < editor.state.doc.content.size
      ? editor.state.doc.nodeAt(blockPos)
      : null;

  if (!isDefined(blockNode)) {
    return null;
  }

  const blockEnd = blockPos + blockNode.nodeSize;
  const hasBlockSettings =
    isDefined(onOpenBlockSettings) &&
    isAdvancedTextEditorBlockNodeType(blockNode.type.name);
  const canTurnInto = TURN_INTO_NODE_TYPES.includes(blockNode.type.name);
  const currentBlockTypeOptionId =
    blockNode.type.name === TIPTAP_NODE_TYPES.HEADING
      ? `heading${blockNode.attrs.level}`
      : blockNode.type.name;
  const currentBlockTypeTitle = turnIntoOptions.find(
    ({ id }) => id === currentBlockTypeOptionId,
  )?.title;

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

  const handleTurnIntoOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      return;
    }

    editor.view.dispatch(
      editor.state.tr.setSelection(
        getTurnIntoSelection({ doc: editor.state.doc, blockPos }),
      ),
    );
  };

  const handleDelete = () =>
    editor.chain().deleteRange({ from: blockPos, to: blockEnd }).run();

  const handleOpenChange = (isOpen: boolean) => {
    if (isOpen) {
      editor.commands.setNodeSelection(blockPos);
    }

    onOpenChange(isOpen);
  };

  return (
    <DropdownRoot
      dropdownId={`advanced-text-editor-block-handle-${instanceId}`}
      type="menu"
      onOpenChange={handleOpenChange}
    >
      <Dropdown.Trigger
        render={
          <LightIconButton
            size="sm"
            emphasis="subtle"
            aria-label={t`Drag to move, click for options`}
          >
            <IconGripVertical stroke={theme.icon.stroke.lg} />
          </LightIconButton>
        }
      />
      <DropdownContent
        side="bottom"
        align="start"
        width={GenericDropdownContentWidth.Medium}
      >
        {(canTurnInto || hasBlockSettings) && (
          <>
            <Dropdown.Section>
              {canTurnInto && (
                <Dropdown.Submenu onOpenChange={handleTurnIntoOpenChange}>
                  <Dropdown.SubmenuTrigger
                    startIcon={<IconTransform />}
                    description={currentBlockTypeTitle}
                    descriptionPlacement="end"
                  >
                    {t`Turn into`}
                  </Dropdown.SubmenuTrigger>
                  <Dropdown.Content aria-label={t`Turn into`}>
                    <Dropdown.Section>
                      {turnIntoOptions.map(
                        ({ id, title, icon, onClick, isActive }) => (
                          <Dropdown.OptionItem
                            key={id}
                            selected={isActive()}
                            startIcon={<SelectOptionIcon Icon={icon} />}
                            onSelect={onClick}
                          >
                            {title}
                          </Dropdown.OptionItem>
                        ),
                      )}
                    </Dropdown.Section>
                  </Dropdown.Content>
                </Dropdown.Submenu>
              )}
              {hasBlockSettings && (
                <Dropdown.ActionItem
                  startIcon={<IconAdjustments />}
                  onClick={handleOpenBlockSettings}
                >
                  {t`Block style`}
                </Dropdown.ActionItem>
              )}
            </Dropdown.Section>
            <Dropdown.Separator />
          </>
        )}
        <Dropdown.Section>
          <Dropdown.ActionItem
            startIcon={<IconPlus />}
            onClick={handleAddBlock}
          >
            {t`Add block below`}
          </Dropdown.ActionItem>
          <Dropdown.ActionItem
            startIcon={<IconCopy />}
            onClick={handleDuplicate}
          >
            {t`Duplicate`}
          </Dropdown.ActionItem>
        </Dropdown.Section>
        <Dropdown.Separator />
        <Dropdown.Section>
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
