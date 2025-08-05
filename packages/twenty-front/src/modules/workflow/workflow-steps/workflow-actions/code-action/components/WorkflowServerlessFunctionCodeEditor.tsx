import { getWrongExportedFunctionMarkers } from '@/workflow/workflow-steps/workflow-actions/code-action/utils/getWrongExportedFunctionMarkers';
import styled from '@emotion/styled';
import { useLingui } from '@lingui/react/macro';
import { Monaco } from '@monaco-editor/react';
import { editor } from 'monaco-editor';
import { IconMaximize } from 'twenty-ui/display';
import { CodeEditor, LightIconButton } from 'twenty-ui/input';

const CODE_EDITOR_MIN_HEIGHT = 343;

const StyledCodeEditorContainer = styled.div`
  display: flex;
  flex-direction: column;
  position: relative;
  flex: 1;
  min-height: ${CODE_EDITOR_MIN_HEIGHT}px;
  overflow: hidden;
`;

const StyledFullScreenButtonContainer = styled.div`
  position: absolute;
  top: ${({ theme }) => theme.spacing(2)};
  right: ${({ theme }) => theme.spacing(2)};
  z-index: 1;
`;

type WorkflowServerlessFunctionCodeEditorProps = {
  value?: string;
  onChange: (value: string) => void;
  onMount: (editor: editor.IStandaloneCodeEditor, monaco: Monaco) => void;
  options: editor.IStandaloneEditorConstructionOptions;
  readonly?: boolean;
  fullScreenMode?: boolean;
  onEnterFullScreen?: () => void;
};

export const WorkflowServerlessFunctionCodeEditor = ({
  value,
  onChange,
  onMount,
  options,
  readonly = false,
  fullScreenMode = false,
  onEnterFullScreen,
}: WorkflowServerlessFunctionCodeEditorProps) => {
  const { t } = useLingui();

  return (
    <StyledCodeEditorContainer>
      {!readonly && !fullScreenMode && onEnterFullScreen && (
        <StyledFullScreenButtonContainer>
          <LightIconButton
            Icon={IconMaximize}
            onClick={onEnterFullScreen}
            title={t`Expand to Full Screen`}
            size="small"
            accent="tertiary"
          />
        </StyledFullScreenButtonContainer>
      )}
      <CodeEditor
        height="100%"
        value={value}
        language={'typescript'}
        onChange={onChange}
        onMount={onMount}
        setMarkers={getWrongExportedFunctionMarkers}
        options={options}
      />
    </StyledCodeEditorContainer>
  );
};
