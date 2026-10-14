import { useState } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { Button } from 'twenty-ui/primitives/input';
import { type CodeEditorProps } from 'twenty-ui/components/code-editor';

import { SettingsLogicFunctionCodeEditor } from '@/settings/logic-functions/components/SettingsLogicFunctionCodeEditor';
import { type SettingsLogicFunctionCodeEditorFile } from '@/settings/logic-functions/types/SettingsLogicFunctionCodeEditorFile';

type ReopeningSettingsLogicFunctionCodeEditorProps = {
  filePathPrefix: string;
  keepCurrentModel?: boolean;
  beforeMount?: CodeEditorProps['beforeMount'];
  onMount: NonNullable<CodeEditorProps['onMount']>;
  onChange: NonNullable<CodeEditorProps['onChange']>;
};

export const ReopeningSettingsLogicFunctionCodeEditor = ({
  filePathPrefix,
  keepCurrentModel,
  beforeMount,
  onMount,
  onChange,
}: ReopeningSettingsLogicFunctionCodeEditorProps) => {
  const indexFilePath = `${filePathPrefix}/index.ts`;
  const helperFilePath = `${filePathPrefix}/helper.ts`;
  const [isOpen, setIsOpen] = useState(true);
  const [currentFilePath, setCurrentFilePath] = useState(indexFilePath);
  const [files, setFiles] = useState<SettingsLogicFunctionCodeEditorFile[]>([
    {
      path: indexFilePath,
      language: 'typescript',
      content: "export const source = 'initial';",
    },
    {
      path: helperFilePath,
      language: 'typescript',
      content: "export const helper = 'secondary';",
    },
  ]);

  const handleChange: NonNullable<CodeEditorProps['onChange']> = (
    value,
    event,
  ) => {
    onChange(value, event);

    if (!isDefined(value)) {
      return;
    }

    setFiles((currentFiles) =>
      currentFiles.map((file) =>
        file.path === currentFilePath ? { ...file, content: value } : file,
      ),
    );
  };

  const reopenEditor = () => {
    setFiles((currentFiles) =>
      currentFiles.map((file) =>
        file.path === indexFilePath
          ? { ...file, content: "export const source = 'updated';" }
          : file,
      ),
    );
    setCurrentFilePath(indexFilePath);
    setIsOpen(true);
  };

  return (
    <>
      <Button
        onClick={() => setCurrentFilePath(helperFilePath)}
        disabled={!isOpen}
      >
        Select helper file
      </Button>
      <Button onClick={() => setIsOpen(false)} disabled={!isOpen}>
        Close editor
      </Button>
      <Button onClick={reopenEditor} disabled={isOpen}>
        Reopen with updated source
      </Button>
      {isOpen && (
        <SettingsLogicFunctionCodeEditor
          currentFilePath={currentFilePath}
          files={files}
          beforeMount={beforeMount}
          onMount={onMount}
          onChange={handleChange}
          keepCurrentModel={keepCurrentModel}
          options={{ occurrencesHighlight: 'off' }}
          variant="borderless"
          height={180}
        />
      )}
    </>
  );
};
