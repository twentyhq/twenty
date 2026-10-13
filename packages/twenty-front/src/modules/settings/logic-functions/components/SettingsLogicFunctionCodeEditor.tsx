import { useGetAvailablePackages } from '@/logic-functions/hooks/useGetAvailablePackages';
import { type SettingsLogicFunctionCodeEditorFile } from '@/settings/logic-functions/types/SettingsLogicFunctionCodeEditorFile';
import { getSettingsLogicFunctionCodeEditorModelPath } from '@/settings/logic-functions/utils/getSettingsLogicFunctionCodeEditorModelPath';
import { AutoTypings } from 'monaco-editor-auto-typings';
import { useParams } from 'react-router-dom';
import { isDefined } from 'twenty-shared/utils';
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
  onMount,
  height = 450,
  variant = 'with-header',
  applicationVariableKeys,
  ...codeEditorProps
}: SettingsLogicFunctionCodeEditorProps) => {
  const { logicFunctionId = '' } = useParams();
  const { availablePackages } = useGetAvailablePackages({
    id: logicFunctionId,
  });

  const currentFile = files.find((file) => file.path === currentFilePath);

  const handleEditorDidMount: NonNullable<CodeEditorProps['onMount']> = async (
    editor,
    monaco,
  ) => {
    onMount?.(editor, monaco);

    if (files.length > 1) {
      for (const file of files) {
        const modelUri = monaco.Uri.parse(
          getSettingsLogicFunctionCodeEditorModelPath(file.path),
        );
        const model = monaco.editor.getModel(modelUri);

        if (!isDefined(model)) {
          monaco.editor.createModel(file.content, file.language, modelUri);
        }
      }

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
          // oxlint-disable-next-line lingui/no-unlocalized-strings
          .map((key) => `${key}: string;`)
          .join('\n');
        const applicationVariableDefinition = `
          declare namespace NodeJS {
            interface ProcessEnv {
              ${envTypeDefinitions}
            }
          }

          declare const process: {
            env: NodeJS.ProcessEnv;
          };
        `;

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
      <CodeEditor
        // oxlint-disable-next-line react/jsx-props-no-spreading
        {...codeEditorProps}
        height={height}
        value={currentFile.content}
        language={currentFile.language}
        path={getSettingsLogicFunctionCodeEditorModelPath(currentFile.path)}
        onMount={handleEditorDidMount}
        variant={variant}
      />
    )
  );
};
