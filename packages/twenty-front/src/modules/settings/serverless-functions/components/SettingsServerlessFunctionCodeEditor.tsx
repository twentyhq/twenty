import { useGetAvailablePackages } from '@/settings/serverless-functions/hooks/useGetAvailablePackages';
import { EditorProps, Monaco } from '@monaco-editor/react';
import dotenv from 'dotenv';
import { editor, MarkerSeverity } from 'monaco-editor';
import { AutoTypings } from 'monaco-editor-auto-typings';
import { CodeEditor } from 'twenty-ui';
import { isDefined } from '~/utils/isDefined';
import { useParams } from 'react-router-dom';

export type File = {
  language: string;
  content: string;
  path: string;
};

type SettingsServerlessFunctionCodeEditorProps = Omit<
  EditorProps,
  'onChange'
> & {
  currentFilePath: string;
  files: File[];
  onChange: (value: string) => void;
  setIsCodeValid: (isCodeValid: boolean) => void;
};

export const SettingsServerlessFunctionCodeEditor = ({
  currentFilePath,
  files,
  onChange,
  setIsCodeValid,
  height = 450,
  options = undefined,
}: SettingsServerlessFunctionCodeEditorProps) => {
  const { serverlessFunctionId = '' } = useParams();
  const { availablePackages } = useGetAvailablePackages({
    id: serverlessFunctionId,
  });

  const currentFile = files.find((file) => file.path === currentFilePath);
  const environmentVariablesFile = files.find((file) => file.path === '.env');

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

      if (isDefined(environmentVariablesFile)) {
        const environmentVariables = dotenv.parse(
          environmentVariablesFile.content,
        );

        const environmentDefinition = `
          declare namespace NodeJS {
            interface ProcessEnv {
              ${Object.keys(environmentVariables)
                .map((key) => `${key}: string;`)
                .join('\n')}
            }
          }
  
          declare const process: {
            env: NodeJS.ProcessEnv;
          };
        `;

        monaco.languages.typescript.typescriptDefaults.setExtraLibs([
          {
            content: environmentDefinition,
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

  const handleEditorValidation = (markers: editor.IMarker[]) => {
    for (const marker of markers) {
      if (marker.severity === MarkerSeverity.Error) {
        setIsCodeValid?.(false);
        return;
      }
    }
    setIsCodeValid?.(true);
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
        onValidate={handleEditorValidation}
        options={options}
        withHeader
      />
    )
  );
};
