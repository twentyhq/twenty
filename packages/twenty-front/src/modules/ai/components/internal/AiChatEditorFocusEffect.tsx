import { type Editor } from '@tiptap/react';
import { useLayoutEffect } from 'react';

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

  useLayoutEffect(() => {
    if (!shouldFocusChatEditor || !editor) {
      return;
    }

    editor.commands.focus('end');
    setShouldFocusChatEditor(false);
  }, [shouldFocusChatEditor, editor, setShouldFocusChatEditor]);

  return null;
};
