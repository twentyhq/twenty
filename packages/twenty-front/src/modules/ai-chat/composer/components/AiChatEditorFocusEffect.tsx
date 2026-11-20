import { type Editor } from '@tiptap/react';
import { useLayoutEffect } from 'react';
import { isDefined } from 'twenty-shared/utils';

import { aiChatShouldFocusEditorFamilyState } from '@/ai-chat/states/aiChatShouldFocusEditorFamilyState';
import { useAiChatInstanceOrThrow } from '@/ai-chat/hooks/useAiChatInstanceOrThrow';
import { useAtomFamilyState } from '@/ui/utilities/state/jotai/hooks/useAtomFamilyState';

type AiChatEditorFocusEffectProps = {
  editor: Editor | null;
};

export const AiChatEditorFocusEffect = ({
  editor,
}: AiChatEditorFocusEffectProps) => {
  const { threadId } = useAiChatInstanceOrThrow();
  const [aiChatShouldFocusEditor, setAiChatShouldFocusEditor] =
    useAtomFamilyState(aiChatShouldFocusEditorFamilyState, { threadId });

  useLayoutEffect(() => {
    // A destroyed editor is still defined while its replacement mounts and its commands throw; keeping the request hands focus to the live one.
    if (!aiChatShouldFocusEditor || !isDefined(editor) || editor.isDestroyed) {
      return;
    }

    editor.commands.focus('end');
    setAiChatShouldFocusEditor(false);
  }, [aiChatShouldFocusEditor, editor, setAiChatShouldFocusEditor]);

  return null;
};
