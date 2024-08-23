import Editor, { Monaco, EditorProps } from '@monaco-editor/react';
import { editor, MarkerSeverity } from 'monaco-editor';
import { codeEditorTheme } from '@/ui/input/code-editor/theme/CodeEditorTheme';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { useEffect } from 'react';

export const DEFAULT_CODE = `export const handler = async (
  event: object,
  context: object
): Promise<object> => {
  // Your code here
  return {};
}
`;

const StyledEditor = styled(Editor)`
  border: 1px solid ${({ theme }) => theme.border.color.medium};
  border-top: none;
  border-radius: 0 0 ${({ theme }) => theme.border.radius.sm}
    ${({ theme }) => theme.border.radius.sm};
`;

type CodeEditorProps = Omit<EditorProps, 'onChange'> & {
  header: React.ReactNode;
  onChange?: (value: string) => void;
  setIsCodeValid?: (isCodeValid: boolean) => void;
};

export const CodeEditor = ({
  value = DEFAULT_CODE,
  onChange,
  setIsCodeValid,
  language = 'typescript',
  height = 450,
  options = undefined,
  header,
}: CodeEditorProps) => {
  const theme = useTheme();

  const handleEditorDidMount = (
    editor: editor.IStandaloneCodeEditor,
    monaco: Monaco,
  ) => {
    monaco.editor.defineTheme('codeEditorTheme', codeEditorTheme(theme));
    monaco.editor.setTheme('codeEditorTheme');
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

  useEffect(() => {
    const style = document.createElement('style');
    style.innerHTML = `
      .monaco-editor .margin .line-numbers {
        font-weight: bold;
      }
    `;
    document.head.appendChild(style);
    return () => {
      document.head.removeChild(style);
    };
  }, []);
  return (
    <div>
      {header}
      <StyledEditor
        height={height}
        language={language}
        value={value}
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
    </div>
  );
};
