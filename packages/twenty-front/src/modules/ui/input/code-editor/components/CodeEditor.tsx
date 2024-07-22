import Editor, { Monaco, EditorProps } from '@monaco-editor/react';
import { editor } from 'monaco-editor';
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
  border-radius: ${({ theme }) => theme.border.radius.sm};
`;

type CodeEditorProps = EditorProps;

export const CodeEditor = ({
  value = DEFAULT_CODE,
  onChange = () => {},
  defaultLanguage = 'typescript',
  height = 500,
  options = undefined,
}: CodeEditorProps) => {
  const theme = useTheme();
  const handleEditorDidMount = (
    editor: editor.IStandaloneCodeEditor,
    monaco: Monaco,
  ) => {
    monaco.editor.defineTheme('codeEditorTheme', codeEditorTheme(theme));
    monaco.editor.setTheme('codeEditorTheme');
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
    <StyledEditor
      height={height}
      defaultLanguage={defaultLanguage}
      value={value}
      onMount={handleEditorDidMount}
      onChange={onChange}
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
  );
};
