import { type Editor } from '@tiptap/react';
import { useEffect } from 'react';
import { isDefined } from 'twenty-shared/utils';

import { deserializeAdvancedTextEditorDocument } from '@/advanced-text-editor/utils/deserializeAdvancedTextEditorDocument';
import { useAiChatInstanceOrThrow } from '@/ai-chat/hooks/useAiChatInstanceOrThrow';
import { aiChatComposerDraftsState } from '@/ai-chat/states/composer/aiChatComposerDraftsState';
import { serializeAiChatEditorDraft } from '@/ai-chat/composer/utils/serializeAiChatEditorDraft';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';

type AiChatEditorDraftSyncEffectProps = {
  editor: Editor | null;
};

export const AiChatEditorDraftSyncEffect = ({
  editor,
}: AiChatEditorDraftSyncEffectProps) => {
  const { threadId } = useAiChatInstanceOrThrow();
  const draft = useAtomStateValue(aiChatComposerDraftsState)[threadId] ?? '';

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
