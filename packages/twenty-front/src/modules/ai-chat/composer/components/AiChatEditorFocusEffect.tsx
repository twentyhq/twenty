import { type Editor } from '@tiptap/react';
import { useLayoutEffect } from 'react';
import { isDefined } from 'twenty-shared/utils';

import { aiChatComposerShouldFocusFamilyState } from '@/ai-chat/states/composer/aiChatComposerShouldFocusFamilyState';
import { useAiChatInstanceOrThrow } from '@/ai-chat/hooks/useAiChatInstanceOrThrow';
import { useAtomFamilyState } from '@/ui/utilities/state/jotai/hooks/useAtomFamilyState';

type AiChatEditorFocusEffectProps = {
  editor: Editor | null;
};

export const AiChatEditorFocusEffect = ({
  editor,
}: AiChatEditorFocusEffectProps) => {
  const { threadId } = useAiChatInstanceOrThrow();
  const [aiChatComposerShouldFocus, setAiChatComposerShouldFocus] =
    useAtomFamilyState(aiChatComposerShouldFocusFamilyState, { threadId });

  useLayoutEffect(() => {
    // A destroyed editor is still defined while its replacement mounts and its commands throw; keeping the request hands focus to the live one.
    if (
      !aiChatComposerShouldFocus ||
      !isDefined(editor) ||
      editor.isDestroyed
    ) {
      return;
    }

    editor.commands.focus('end');
    setAiChatComposerShouldFocus(false);
  }, [aiChatComposerShouldFocus, editor, setAiChatComposerShouldFocus]);

  return null;
};
