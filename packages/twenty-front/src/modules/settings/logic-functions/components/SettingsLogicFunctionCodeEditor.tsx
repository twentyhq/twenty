import { useGetAvailablePackages } from '@/logic-functions/hooks/useGetAvailablePackages';
import { type EditorProps, type Monaco } from '@monaco-editor/react';
import { type editor } from 'monaco-editor';
import { AutoTypings } from 'monaco-editor-auto-typings';
import { useParams } from 'react-router-dom';
import { isDefined } from 'twenty-shared/utils';
import { CodeEditor } from 'twenty-ui/input';

export type File = {
  language: string;
  content: string;
  path: string;
};

type SettingsLogicFunctionCodeEditorProps = Omit<EditorProps, 'onChange'> & {
  currentFilePath: string;
  files: File[];
  onChange: (value: string) => void;
  applicationVariableKeys?: string[];
};

export const SettingsLogicFunctionCodeEditor = ({
  currentFilePath,
  files,
  onChange,
  height = 450,
  options = undefined,
  applicationVariableKeys,
}: SettingsLogicFunctionCodeEditorProps) => {
  const { logicFunctionId = '' } = useParams();
  const { availablePackages } = useGetAvailablePackages({
    id: logicFunctionId,
  });

  const currentFile = files.find((file) => file.path === currentFilePath);

  const handleEditorDidMount = async (
    editor: editor.IStandaloneCodeEditor,
    monaco: Monaco,
  ) => {
    if (files.length > 1) {
      files.forEach((file) => {
        const model = monaco.editor.getModel(monaco.Uri.file(file.path));

        if (!isDefined(model)) {
          monaco.editor.createModel(
            file.content,
            file.language,
            monaco.Uri.file(file.path),
          );
        }
      });

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
        height={height}
        value={currentFile.content}
        language={currentFile.language}
        onMount={handleEditorDidMount}
        onChange={onChange}
        options={options}
        variant="with-header"
      />
    )
  );
};
