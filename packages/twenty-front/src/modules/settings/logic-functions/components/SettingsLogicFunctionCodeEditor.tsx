import { useGetAvailablePackages } from '@/logic-functions/hooks/useGetAvailablePackages';
import { SettingsLogicFunctionCodeEditorModelsEffect } from '@/settings/logic-functions/components/SettingsLogicFunctionCodeEditorModelsEffect';
import { type SettingsLogicFunctionCodeEditorFile } from '@/settings/logic-functions/types/SettingsLogicFunctionCodeEditorFile';
import { createSettingsLogicFunctionCodeEditorModels } from '@/settings/logic-functions/utils/createSettingsLogicFunctionCodeEditorModels';
import { getSettingsLogicFunctionCodeEditorModelPath } from '@/settings/logic-functions/utils/getSettingsLogicFunctionCodeEditorModelPath';
import { type editor } from 'monaco-editor';
import { AutoTypings } from 'monaco-editor-auto-typings';
import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { isDefined } from 'twenty-shared/utils';
import { doNotTranslate } from 'twenty-shared/i18n';
import {
  CodeEditor,
  type CodeEditorProps,
} from 'twenty-ui/components/code-editor';

type SettingsLogicFunctionCodeEditorProps = Omit<
  CodeEditorProps,
  | 'value'
  | 'defaultValue'
  | 'language'
  | 'defaultLanguage'
  | 'path'
  | 'defaultPath'
> & {
  currentFilePath: string;
  files: SettingsLogicFunctionCodeEditorFile[];
  applicationVariableKeys?: string[];
};

export const SettingsLogicFunctionCodeEditor = ({
  currentFilePath,
  files,
  beforeMount,
  onMount,
  keepCurrentModel = false,
  height = 450,
  variant = 'with-header',
  applicationVariableKeys,
  ...codeEditorProps
}: SettingsLogicFunctionCodeEditorProps) => {
  const { logicFunctionId = '' } = useParams();
  const { availablePackages } = useGetAvailablePackages({
    id: logicFunctionId,
  });
  const [editor, setEditor] = useState<editor.IStandaloneCodeEditor>();
  const [ownedModels, setOwnedModels] = useState<editor.ITextModel[]>([]);

  const currentFile = files.find((file) => file.path === currentFilePath);

  const handleEditorWillMount: NonNullable<CodeEditorProps['beforeMount']> = (
    monaco,
  ) => {
    beforeMount?.(monaco);
    setOwnedModels(
      createSettingsLogicFunctionCodeEditorModels({ monaco, files }),
    );
  };

  const handleEditorDidMount: NonNullable<CodeEditorProps['onMount']> = async (
    editor,
    monaco,
  ) => {
    setEditor(editor);
    onMount?.(editor, monaco);

    if (files.length > 1) {
      monaco.languages.typescript.typescriptDefaults.setCompilerOptions({
        ...monaco.languages.typescript.typescriptDefaults.getCompilerOptions(),
        moduleResolution:
          monaco.languages.typescript.ModuleResolutionKind.NodeJs,
        baseUrl: 'file:///src',
        paths: {
          'src/*': ['file:///src/*'],
        },
        allowSyntheticDefaultImports: true,
        esModuleInterop: true,
        noEmit: true,
        target: monaco.languages.typescript.ScriptTarget.ESNext,
      });

      const applicationVariables = Object.fromEntries(
        (applicationVariableKeys ?? []).map((key) => [key, '']),
      );

      if (isDefined(applicationVariables)) {
        const envTypeDefinitions = Object.keys(applicationVariables)
          .map((key) => doNotTranslate(`${key}: string;`))
          .join('\n');
        const applicationVariableDefinition = doNotTranslate(`
          declare namespace NodeJS {
            interface ProcessEnv {
              ${envTypeDefinitions}
            }
          }

          declare const process: {
            env: NodeJS.ProcessEnv;
          };
        `);

        monaco.languages.typescript.typescriptDefaults.setExtraLibs([
          {
            content: applicationVariableDefinition,
            filePath: 'ts:process-env.d.ts',
          },
        ]);
      }

      await AutoTypings.create(editor, {
        monaco,
        preloadPackages: true,
        onlySpecifiedPackages: true,
        versions: availablePackages,
        debounceDuration: 0,
      });
    }
  };

  return (
    isDefined(currentFile) &&
    isDefined(availablePackages) && (
      <>
        <CodeEditor
          // oxlint-disable-next-line react/jsx-props-no-spreading
          {...codeEditorProps}
          height={height}
          value={currentFile.content}
          language={currentFile.language}
          path={getSettingsLogicFunctionCodeEditorModelPath(currentFile.path)}
          beforeMount={handleEditorWillMount}
          onMount={handleEditorDidMount}
          keepCurrentModel={keepCurrentModel}
          variant={variant}
        />
        <SettingsLogicFunctionCodeEditorModelsEffect
          editor={editor}
          ownedModels={ownedModels}
          keepCurrentModel={keepCurrentModel}
        />
      </>
    )
  );
};
