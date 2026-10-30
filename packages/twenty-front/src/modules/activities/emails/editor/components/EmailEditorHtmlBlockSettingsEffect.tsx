import { type Editor, type EditorEvents } from '@tiptap/core';
import { NodeSelection, type Transaction } from '@tiptap/pm/state';
import { useEffect } from 'react';
import { isDefined, TIPTAP_NODE_TYPES } from 'twenty-shared/utils';

import { getInsertedNodePosition } from '@/advanced-text-editor/utils/getInsertedNodePosition';
import { useOpenEmailBlockStyleInSidePanel } from '@/side-panel/hooks/useOpenEmailBlockStyleInSidePanel';

const isHtmlBlockClick = (transaction: Transaction) =>
  transaction.getMeta('pointer') === true &&
  transaction.selection instanceof NodeSelection &&
  transaction.selection.node.type.name === TIPTAP_NODE_TYPES.HTML;

type EmailEditorHtmlBlockSettingsEffectProps = {
  editor: Editor;
};

export const EmailEditorHtmlBlockSettingsEffect = ({
  editor,
}: EmailEditorHtmlBlockSettingsEffectProps) => {
  const { openEmailBlockStyleInSidePanel } =
    useOpenEmailBlockStyleInSidePanel();

  useEffect(() => {
    const handleTransaction = ({
      transaction,
    }: EditorEvents['transaction']) => {
      if (isHtmlBlockClick(transaction)) {
        openEmailBlockStyleInSidePanel();
        return;
      }

      const insertedHtmlBlockPosition = getInsertedNodePosition({
        transaction,
        nodeTypeName: TIPTAP_NODE_TYPES.HTML,
      });

      if (!isDefined(insertedHtmlBlockPosition)) {
        return;
      }

      queueMicrotask(() => {
        if (editor.isDestroyed) {
          return;
        }

        editor.commands.setNodeSelection(insertedHtmlBlockPosition);
        openEmailBlockStyleInSidePanel();
      });
    };

    editor.on('transaction', handleTransaction);

    return () => {
      editor.off('transaction', handleTransaction);
    };
  }, [editor, openEmailBlockStyleInSidePanel]);

  return null;
};
