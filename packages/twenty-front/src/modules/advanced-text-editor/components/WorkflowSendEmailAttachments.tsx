import { useUploadWorkflowFile } from '@/advanced-text-editor/hooks/useUploadWorkflowFile';
import { AttachmentChip } from '@/file/components/AttachmentChip';
import { useFileUpload } from '@/file-upload/hooks/useFileUpload';
import { VariableChip } from '@/object-record/record-field/ui/form-types/components/VariableChip';
import { type VariablePickerComponent } from '@/object-record/record-field/ui/form-types/types/VariablePickerComponent';
import { InputLabel } from '@/ui/input/components/InputLabel';

import { isString } from '@sniptt/guards';
import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { useContext, useId } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { type WorkflowEmailFiles } from 'twenty-shared/workflow';
import { IconUpload } from 'twenty-ui-deprecated/display';
import {
  ThemeContext,
  themeCssVariables,
} from 'twenty-ui-deprecated/theme-constants';

type WorkflowSendEmailAttachmentsProps = {
  files: WorkflowEmailFiles;
  onChange: (files: WorkflowEmailFiles) => void;
  label?: string;
  readonly?: boolean;
  VariablePicker?: VariablePickerComponent;
};

const StyledContainer = styled.div`
  display: flex;
  flex-direction: column;
`;

const StyledRow = styled.div`
  display: flex;
  flex-direction: row;
`;

const StyledUploadArea = styled.div<{ hasFiles: boolean; hasPicker: boolean }>`
  background-color: ${themeCssVariables.background.transparent.lighter};
  border: 1px solid ${themeCssVariables.border.color.medium};
  border-bottom-left-radius: ${themeCssVariables.border.radius.sm};
  border-bottom-right-radius: ${({ hasPicker }) =>
    hasPicker ? '0' : themeCssVariables.border.radius.sm};
  border-right: ${({ hasPicker }) =>
    hasPicker ? 'none' : `1px solid ${themeCssVariables.border.color.medium}`};
  border-top-left-radius: ${themeCssVariables.border.radius.sm};
  border-top-right-radius: ${({ hasPicker }) =>
    hasPicker ? '0' : themeCssVariables.border.radius.sm};
  display: flex;
  flex: 1;
  flex-direction: column;
  justify-content: center;
  min-height: ${({ hasFiles }) => (hasFiles ? 'auto' : '24px')};
  padding-bottom: ${themeCssVariables.spacing[1]};
  padding-left: ${themeCssVariables.spacing[2]};
  padding-right: ${themeCssVariables.spacing[2]};
  padding-top: ${themeCssVariables.spacing[1]};

  &:hover {
    background-color: ${themeCssVariables.background.transparent.light};
    border-color: ${themeCssVariables.border.color.strong};
  }
`;

const StyledChipsContainer = styled.div`
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  gap: ${themeCssVariables.spacing[1]};
`;

const StyledVariableChipWrapper = styled.span`
  display: inline-flex;
`;

const StyledUploadAreaLabel = styled.div`
  color: ${themeCssVariables.font.color.tertiary};
  display: flex;
  font-size: ${themeCssVariables.font.size.sm};
  font-weight: ${themeCssVariables.font.weight.medium};
  gap: ${themeCssVariables.spacing[1]};
  justify-content: center;
`;

export const WorkflowSendEmailAttachments = ({
  files,
  label,
  onChange,
  readonly,
  VariablePicker,
}: WorkflowSendEmailAttachmentsProps) => {
  const instanceId = useId();
  const { theme } = useContext(ThemeContext);
  const { uploadWorkflowFile } = useUploadWorkflowFile();
  const { openFileUpload } = useFileUpload();
  const { t } = useLingui();

  const handleUploadFiles = async (filesToUpload: File[]) => {
    const uploadedFiles = await Promise.all(
      filesToUpload.map((file) => uploadWorkflowFile(file)),
    );

    const successfulUploads = uploadedFiles.filter(isDefined);

    if (successfulUploads.length > 0) {
      onChange([...files, ...successfulUploads]);
    }
  };

  const handleAddFileClick = () => {
    if (readonly) {
      return;
    }

    openFileUpload({
      multiple: true,
      onUpload: handleUploadFiles,
    });
  };

  const handleAddVariable = (variableName: string) => {
    onChange([...files, variableName]);
  };

  const handleRemoveItem = (indexToRemove: number) => {
    onChange(files.filter((_, index) => index !== indexToRemove));
  };

  const hasPicker = isDefined(VariablePicker) && !readonly;

  return (
    <StyledContainer>
      {label ? <InputLabel>{label}</InputLabel> : null}

      <StyledRow>
        <StyledUploadArea
          hasFiles={files.length > 0}
          hasPicker={hasPicker}
          onClick={handleAddFileClick}
        >
          {files.length > 0 ? (
            <StyledChipsContainer>
              {files.map((file, index) =>
                isString(file) ? (
                  <StyledVariableChipWrapper
                    key={index}
                    onClick={(event) => event.stopPropagation()}
                  >
                    <VariableChip
                      rawVariableName={file}
                      onRemove={
                        readonly ? undefined : () => handleRemoveItem(index)
                      }
                    />
                  </StyledVariableChipWrapper>
                ) : (
                  <AttachmentChip
                    key={index}
                    file={file}
                    onRemove={() => handleRemoveItem(index)}
                    readonly={readonly}
                  />
                ),
              )}
            </StyledChipsContainer>
          ) : (
            <StyledUploadAreaLabel>
              <IconUpload size={theme.icon.size.sm} />
              <span>{t`Upload file`}</span>
            </StyledUploadAreaLabel>
          )}
        </StyledUploadArea>

        {hasPicker ? (
          <VariablePicker
            instanceId={instanceId}
            onVariableSelect={handleAddVariable}
          />
        ) : null}
      </StyledRow>
    </StyledContainer>
  );
};
