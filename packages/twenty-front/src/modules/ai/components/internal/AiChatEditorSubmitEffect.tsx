import { type Editor } from '@tiptap/react';
import { useEffect } from 'react';
import { isDefined } from 'twenty-shared/utils';

import { hasAgentChatBeenOpenedState } from '@/ai/states/hasAgentChatBeenOpenedState';
import { shouldSubmitChatEditorState } from '@/ai/states/shouldSubmitChatEditorState';
import { dispatchAgentChatSendMessageEvent } from '@/ai/utils/dispatchAgentChatSendMessageEvent';
import { useAtomState } from '@/ui/utilities/state/jotai/hooks/useAtomState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';

type AiChatEditorSubmitEffectProps = {
  editor: Editor | null;
};

export const AiChatEditorSubmitEffect = ({
  editor,
}: AiChatEditorSubmitEffectProps) => {
  const [shouldSubmitChatEditor, setShouldSubmitChatEditor] = useAtomState(
    shouldSubmitChatEditorState,
  );
  const hasAgentChatBeenOpened = useAtomStateValue(hasAgentChatBeenOpenedState);

  useEffect(() => {
    if (
      !shouldSubmitChatEditor ||
      !isDefined(editor) ||
      !hasAgentChatBeenOpened
    ) {
      return;
    }

    const rafId = requestAnimationFrame(() => {
      dispatchAgentChatSendMessageEvent();
      editor.commands.clearContent();
      setShouldSubmitChatEditor(false);
    });

    return () => {
      cancelAnimationFrame(rafId);
    };
  }, [
    shouldSubmitChatEditor,
    editor,
    hasAgentChatBeenOpened,
    setShouldSubmitChatEditor,
  ]);

  return null;
};
