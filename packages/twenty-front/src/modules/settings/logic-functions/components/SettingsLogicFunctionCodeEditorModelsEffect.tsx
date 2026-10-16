import { type editor } from 'monaco-editor';
import { useEffect } from 'react';
import { isDefined } from 'twenty-shared/utils';

type SettingsLogicFunctionCodeEditorModelsEffectProps = {
  editor: editor.IStandaloneCodeEditor | undefined;
  ownedModels: editor.ITextModel[];
  keepCurrentModel: boolean;
};

export const SettingsLogicFunctionCodeEditorModelsEffect = ({
  editor,
  ownedModels,
  keepCurrentModel,
}: SettingsLogicFunctionCodeEditorModelsEffectProps) => {
  useEffect(() => {
    if (!isDefined(editor) || keepCurrentModel) {
      return;
    }

    const subscription = editor.onDidDispose(() => {
      for (const model of ownedModels) {
        if (!model.isDisposed()) {
          model.dispose();
        }
      }
    });

    return () => subscription.dispose();
  }, [editor, ownedModels, keepCurrentModel]);

  return null;
};
