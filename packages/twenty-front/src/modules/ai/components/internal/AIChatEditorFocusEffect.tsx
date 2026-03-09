import { type Editor } from '@tiptap/react';
import { useEffect } from 'react';

import { focusEditorAfterMigrateState } from '@/ai/states/focusEditorAfterMigrateState';
import { useAtomState } from '@/ui/utilities/state/jotai/hooks/useAtomState';

type AIChatEditorFocusEffectProps = {
  editor: Editor | null;
};

export const AIChatEditorFocusEffect = ({
  editor,
}: AIChatEditorFocusEffectProps) => {
  const [focusEditorAfterMigrate, setFocusEditorAfterMigrate] = useAtomState(
    focusEditorAfterMigrateState,
  );

  useEffect(() => {
    if (!focusEditorAfterMigrate || !editor) {
      return;
    }

    const rafId = requestAnimationFrame(() => {
      editor.commands.focus('end');
      setFocusEditorAfterMigrate(false);
    });

    return () => {
      cancelAnimationFrame(rafId);
    };
  }, [focusEditorAfterMigrate, editor, setFocusEditorAfterMigrate]);

  return null;
};
