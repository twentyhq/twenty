import { codeEditorTheme } from '@/ui/input/code-editor/theme/CodeEditorTheme';
import { useTheme } from '@emotion/react';
import Editor, { EditorProps } from '@monaco-editor/react';
import { isDefined } from 'twenty-ui';

type CodeEditorProps = Omit<EditorProps, 'onChange'> & {
  onChange?: (value: string) => void;
};

export const CodeEditor = ({
  value,
  language,
  onMount,
  onChange,
  onValidate,
  height = 450,
  options,
}: CodeEditorProps) => {
  const theme = useTheme();

  return (
    <Editor
      height={height}
      value={value}
      language={language}
      onMount={(editor, monaco) => {
        monaco.editor.defineTheme('codeEditorTheme', codeEditorTheme(theme));
        monaco.editor.setTheme('codeEditorTheme');

        onMount?.(editor, monaco);
      }}
      onChange={(value) => {
        if (isDefined(value)) {
          onChange?.(value);
        }
      }}
      onValidate={onValidate}
      options={{
        overviewRulerLanes: 0,
        scrollbar: {
          vertical: 'hidden',
          horizontal: 'hidden',
        },
        minimap: {
          enabled: false,
        },
        ...options,
      }}
    />
  );
};
