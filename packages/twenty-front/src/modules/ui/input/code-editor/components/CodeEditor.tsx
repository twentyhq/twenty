import Editor, { Monaco, EditorProps } from '@monaco-editor/react';
import dotenv from 'dotenv';
import { AutoTypings } from 'monaco-editor-auto-typings';
import { editor, MarkerSeverity } from 'monaco-editor';
import { codeEditorTheme } from '@/ui/input/code-editor/theme/CodeEditorTheme';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { useGetAvailablePackages } from '@/settings/serverless-functions/hooks/useGetAvailablePackages';
import { isDefined } from '~/utils/isDefined';

const StyledEditor = styled(Editor)`
  border: 1px solid ${({ theme }) => theme.border.color.medium};
  border-top: none;
  border-radius: 0 0 ${({ theme }) => theme.border.radius.sm}
    ${({ theme }) => theme.border.radius.sm};
`;

export type File = {
  language: string;
  content: string;
  path: string;
};

type CodeEditorProps = Omit<EditorProps, 'onChange'> & {
  currentFilePath: string;
  files: File[];
  onChange?: (value: string) => void;
  setIsCodeValid?: (isCodeValid: boolean) => void;
};

export const CodeEditor = ({
  currentFilePath,
  files,
  onChange,
  setIsCodeValid,
  height = 450,
  options = undefined,
}: CodeEditorProps) => {
  const theme = useTheme();

  const { availablePackages } = useGetAvailablePackages();

  const currentFile = files.find((file) => file.path === currentFilePath);
  const environmentVariablesFile = files.find((file) => file.path === '.env');

  const handleEditorDidMount = async (
    editor: editor.IStandaloneCodeEditor,
    monaco: Monaco,
  ) => {
    monaco.editor.defineTheme('codeEditorTheme', codeEditorTheme(theme));
    monaco.editor.setTheme('codeEditorTheme');

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

        monaco.languages.typescript.typescriptDefaults.addExtraLib(
          environmentDefinition,
          'ts:process-env.d.ts',
        );
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
      <StyledEditor
        height={height}
        value={currentFile.content}
        language={currentFile.language}
        onMount={handleEditorDidMount}
        onChange={(value?: string) => value && onChange?.(value)}
        onValidate={handleEditorValidation}
        options={{
          ...options,
          overviewRulerLanes: 0,
          scrollbar: {
            vertical: 'hidden',
            horizontal: 'hidden',
          },
          minimap: {
            enabled: false,
          },
        }}
      />
    )
  );
};
