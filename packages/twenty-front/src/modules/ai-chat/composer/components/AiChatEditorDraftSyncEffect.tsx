import { type Editor } from '@tiptap/react';
import { useEffect } from 'react';
import { isDefined } from 'twenty-shared/utils';

import { deserializeAdvancedTextEditorDocument } from '@/advanced-text-editor/utils/deserializeAdvancedTextEditorDocument';
import { useAiChatInstanceOrThrow } from '@/ai-chat/hooks/useAiChatInstanceOrThrow';
import { aiChatDraftFamilySelector } from '@/ai-chat/states/selectors/aiChatDraftFamilySelector';
import { serializeAiChatEditorDraft } from '@/ai-chat/composer/utils/serializeAiChatEditorDraft';
import { useAtomFamilySelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilySelectorValue';

type AiChatEditorDraftSyncEffectProps = {
  editor: Editor | null;
};

export const AiChatEditorDraftSyncEffect = ({
  editor,
}: AiChatEditorDraftSyncEffectProps) => {
  const { threadId } = useAiChatInstanceOrThrow();
  const draft = useAtomFamilySelectorValue(aiChatDraftFamilySelector, threadId);

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
