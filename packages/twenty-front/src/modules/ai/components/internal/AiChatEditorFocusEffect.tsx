import { type Editor } from '@tiptap/react';
import { useLayoutEffect } from 'react';
import { isDefined } from 'twenty-shared/utils';

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
    // A destroyed editor is still defined while its replacement mounts and its commands throw; keeping the request hands focus to the live one.
    if (!shouldFocusChatEditor || !isDefined(editor) || editor.isDestroyed) {
      return;
    }

    editor.commands.focus('end');
    setShouldFocusChatEditor(false);
  }, [shouldFocusChatEditor, editor, setShouldFocusChatEditor]);

  return null;
};
