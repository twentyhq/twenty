import { type Editor } from '@tiptap/react';
import { useEffect } from 'react';
import { isDefined } from 'twenty-shared/utils';

import { deserializeAdvancedTextEditorDocument } from '@/advanced-text-editor/utils/deserializeAdvancedTextEditorDocument';
import { useAiChatInstance } from '@/ai/hooks/useAiChatInstance';
import { aiChatDraftsByThreadIdState } from '@/ai/states/aiChatDraftsByThreadIdState';
import { serializeAiChatEditorDraft } from '@/ai/utils/serializeAiChatEditorDraft';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';

type AiChatEditorDraftSyncEffectProps = {
  editor: Editor | null;
};

export const AiChatEditorDraftSyncEffect = ({
  editor,
}: AiChatEditorDraftSyncEffectProps) => {
  const { threadId } = useAiChatInstance();
  const draft = useAtomStateValue(aiChatDraftsByThreadIdState)[threadId] ?? '';

  useEffect(() => {
    if (
      !isDefined(editor) ||
      editor.isDestroyed ||
      editor.isFocused ||
      serializeAiChatEditorDraft(editor) === draft
    ) {
      return;
    }

    editor.commands.setContent(
      deserializeAdvancedTextEditorDocument({ serializedDocument: draft }),
      { emitUpdate: false },
    );
  }, [draft, editor]);

  return null;
};
