import Editor, { Monaco } from '@monaco-editor/react';
import { editor } from 'monaco-editor';
import { codeEditorTheme } from '@/ui/input/code-editor/theme/CodeEditorTheme';
import { DEFAULT_CODE } from '@/ui/input/code-editor/constants/DefaultCode';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { useEffect } from 'react';

const StyledEditor = styled(Editor)`
  border: 1px solid ${({ theme }) => theme.border.color.medium};
  border-radius: ${({ theme }) => theme.border.radius.sm};
`;

export const CodeEditor = () => {
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
      defaultValue={DEFAULT_CODE}
      onMount={handleEditorDidMount}
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
