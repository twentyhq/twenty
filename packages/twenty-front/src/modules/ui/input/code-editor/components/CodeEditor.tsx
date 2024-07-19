import Editor, { EditorProps, Monaco } from '@monaco-editor/react';
import { editor } from 'monaco-editor';
import { codeEditorTheme } from '@/ui/input/code-editor/theme/CodeEditorTheme';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { useEffect } from 'react';

const StyledEditor = styled(Editor)`
  border: 1px solid ${({ theme }) => theme.border.color.medium};
  border-radius: ${({ theme }) => theme.border.radius.sm};
`;

type CodeEditorProps = EditorProps;

export const CodeEditor = ({
  value = '',
  onChange = () => {},
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
      height="500px"
      defaultLanguage="typescript"
      defaultValue={value}
      onMount={handleEditorDidMount}
      onChange={onChange}
      options={{
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
