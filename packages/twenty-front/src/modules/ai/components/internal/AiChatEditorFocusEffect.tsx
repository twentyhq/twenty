import { type Editor } from '@tiptap/react';
import { useEffect } from 'react';

import { shouldFocusChatEditorState } from '@/ai/states/shouldFocusChatEditorState';
import { useAtomState } from '@/ui/utilities/state/jotai/hooks/useAtomState';

type AiChatEditorFocusEffectProps = {
  editor: Editor | null;
};

export const AiChatEditorFocusEffect = ({
  editor,
}: AiChatEditorFocusEffectProps) => {
  const [shouldFocusChatEditor, setShouldFocusChatEditor] = useAtomState(
    shouldFocusChatEditorState,
  );

  useEffect(() => {
    if (!shouldFocusChatEditor || !editor) {
      return;
    }

    const rafId = requestAnimationFrame(() => {
      editor.commands.focus('end');
      setShouldFocusChatEditor(false);
    });

    return () => {
      cancelAnimationFrame(rafId);
    };
  }, [shouldFocusChatEditor, editor, setShouldFocusChatEditor]);

  return null;
};
