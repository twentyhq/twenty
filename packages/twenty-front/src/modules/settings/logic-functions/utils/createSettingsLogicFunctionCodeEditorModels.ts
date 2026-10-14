import { type SettingsLogicFunctionCodeEditorFile } from '@/settings/logic-functions/types/SettingsLogicFunctionCodeEditorFile';
import { getSettingsLogicFunctionCodeEditorModelPath } from '@/settings/logic-functions/utils/getSettingsLogicFunctionCodeEditorModelPath';
import { type Monaco } from '@monaco-editor/react';
import { type editor } from 'monaco-editor';
import { isDefined } from 'twenty-shared/utils';

export const createSettingsLogicFunctionCodeEditorModels = ({
  monaco,
  files,
}: {
  monaco: Monaco;
  files: SettingsLogicFunctionCodeEditorFile[];
}): editor.ITextModel[] => {
  const ownedModels: editor.ITextModel[] = [];

  for (const file of files) {
    const modelUri = monaco.Uri.parse(
      getSettingsLogicFunctionCodeEditorModelPath(file.path),
    );

    if (isDefined(monaco.editor.getModel(modelUri))) {
      continue;
    }

    ownedModels.push(
      monaco.editor.createModel(file.content, file.language, modelUri),
    );
  }

  return ownedModels;
};
