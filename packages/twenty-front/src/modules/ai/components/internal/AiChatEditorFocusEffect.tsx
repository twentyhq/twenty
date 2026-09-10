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
    // An editor destroyed while its replacement mounts is still defined here,
    // and reading its commands throws. Leaving the request set hands the focus
    // to the live editor instead.
    if (!shouldFocusChatEditor || !isDefined(editor) || editor.isDestroyed) {
      return;
    }

    editor.commands.focus('end');
    setShouldFocusChatEditor(false);
  }, [shouldFocusChatEditor, editor, setShouldFocusChatEditor]);

  return null;
};
