import { useApolloCoreClient } from '@/object-metadata/hooks/useApolloCoreClient';
import { FormFieldInputContainer } from '@/object-record/record-field/ui/form-types/components/FormFieldInputContainer';
import { FormTextFieldInput } from '@/object-record/record-field/ui/form-types/components/FormTextFieldInput';
import { InputLabel } from '@/ui/input/components/InputLabel';
import { Select } from '@/ui/input/components/Select';
import { type FormDataFile } from '@/workflow/workflow-steps/workflow-actions/http-request-action/constants/HttpRequest';
import { WorkflowVariablePicker } from '@/workflow/workflow-variables/components/WorkflowVariablePicker';
import { css } from '@emotion/react';
import styled from '@emotion/styled';
import { isNonEmptyString } from '@sniptt/guards';
import { useState } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { IconTrash } from 'twenty-ui/display';
import { Button, type SelectOption } from 'twenty-ui/input';
import { v4 } from 'uuid';
import { useUploadFileMutation } from '~/generated-metadata/graphql';
import { FileFolder } from '~/generated/graphql';

const StyledContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(2)};
`;

const StyledKeyValueContainer = styled.div<{ readonly: boolean | undefined }>`
  display: grid;
  gap: ${({ theme }) => theme.spacing(2)};

  ${({ readonly, theme }) =>
    readonly
      ? css`
          grid-template-columns: repeat(2, minmax(0, 1fr));
        `
      : css`
          grid-template-columns: repeat(2, minmax(0, 1fr)) ${theme.spacing(8)};
        `};
`;
const StyledFileInputWrapper = styled.div`
  align-items: center;
  background-color: ${({ theme }) => theme.background.transparent.lighter};
  border: 1px solid ${({ theme }) => theme.border.color.medium};
  border-radius: ${({ theme }) => theme.border.radius.sm};
  cursor: pointer;
  display: flex;
  padding: ${({ theme }) => theme.spacing(1)};
  position: relative;
`;

const StyledHiddenFileInput = styled.input`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  opacity: 0;
  cursor: pointer;
`;

const StyledFileNameDisplay = styled.span<{ hasFile: boolean }>`
  color: ${({ theme, hasFile }) =>
    hasFile ? theme.font.color.primary : theme.font.color.tertiary};
  pointer-events: none;
  font-style: ${({ hasFile }) => (hasFile ? 'normal' : 'italic')};
`;

const StyledKeyInputContainer = styled.div`
  display: flex;
  align-items: stretch;
  border: 1px solid ${({ theme }) => theme.border.color.medium};
  border-radius: ${({ theme }) => theme.border.radius.sm};
  background-color: ${({ theme }) => theme.background.primary};

  position: relative;
`;

const StyledSelectInKey = styled.div`
  min-width: 70px;
  width: 70px;
  flex-shrink: 0;
  border-right: 1px solid ${({ theme }) => theme.border.color.medium};
  z-index: 2;

  .select-container {
    border: none;
    border-radius: 0;
    background: ${({ theme }) => theme.background.primary};
    height: 100%;
  }
`;

const StyledKeyInputWrapper = styled.div`
  flex: 1;
  min-width: 0;
  position: relative;

  & > div {
    border: none;
    border-radius: 0;
  }

  input {
    padding-left: ${({ theme }) => theme.spacing(2)};
  }
`;

export type KeyValuePair = {
  id: string;
  key: string;
  value: string | Array<FormDataFile>;
  inputType: 'text' | 'file';
};

export type MultiPartFormDataInputProps = {
  label?: string;
  defaultValue?: Record<string, string | Array<FormDataFile>>;
  onChange?: (value: Record<string, string | Array<FormDataFile>>) => void;
  readonly?: boolean;
  keyPlaceholder?: string;
};

const inputTypeOptions: SelectOption<'text' | 'file'>[] = [
  { value: 'text', label: 'Text' },
  { value: 'file', label: 'File' },
];

export const MultiPartFormDataInput = ({
  label,
  defaultValue = {},
  onChange,
  readonly,
  keyPlaceholder = 'Key',
}: MultiPartFormDataInputProps) => {
  const [pairs, setPairs] = useState<KeyValuePair[]>(() => {
    const initialPairs = Object.entries(defaultValue).map(([key, value]) => ({
      id: v4(),
      key,
      value,
      inputType:
        typeof value === 'string' ? ('text' as const) : ('file' as const),
    }));
    return initialPairs.length > 0
      ? [...initialPairs, { id: v4(), key: '', value: '', inputType: 'text' }]
      : [{ id: v4(), key: '', value: '', inputType: 'text' }];
  });

  const coreClient = useApolloCoreClient();
  const [uploadFile] = useUploadFileMutation({ client: coreClient });
  const savePairs = (newPairs: KeyValuePair[]) => {
    const record = newPairs.reduce(
      (acc, { key, value }) => {
        if (key.trim().length > 0) {
          acc[key] = value;
        }
        return acc;
      },
      {} as Record<string, string | Array<FormDataFile>>,
    );

    onChange?.(record);
  };
  const handlePairChange = (
    pairId: string,
    field: 'key' | 'value',
    newValue: string,
  ) => {
    const index = pairs.findIndex((p) => p.id === pairId);
    const newPairs = [...pairs];
    newPairs[index] = { ...newPairs[index], [field]: newValue };

    if (
      index === pairs.length - 1 &&
      (field === 'key' || field === 'value') &&
      Boolean(newValue.trim())
    ) {
      newPairs.push({ id: v4(), key: '', value: '', inputType: 'text' });
    }

    setPairs(newPairs);

    savePairs(newPairs);
  };

  const handleRemovePair = (pairId: string) => {
    const newPairs = pairs.filter((pair) => pair.id !== pairId);
    if (newPairs.length === 0) {
      newPairs.push({ id: v4(), key: '', value: '', inputType: 'text' });
    }
    setPairs(newPairs);

    savePairs(newPairs);
  };
  const handleUploadFile = async (files: FileList) => {
    const result = await uploadFile({
      variables: {
        file: files[0],
        fileFolder: FileFolder.File,
      },
    });

    const signedFile = result?.data?.uploadFile;

    if (!isDefined(signedFile)) {
      throw new Error("Couldn't upload the file.");
    }

    const { path } = signedFile;
    return path;
  };
  const handleSaveFilePathUploaded = async (
    files: FileList | null,
    pairId: string,
  ) => {
    if (!isDefined(files)) return;
    const path = await handleUploadFile(files);
    const index = pairs.findIndex((p) => p.id === pairId);
    const newPairs = [...pairs];
    newPairs[index] = {
      ...newPairs[index],
      value: [{ path, filename: files[0].name }],
    };
    setPairs(newPairs);
    savePairs(newPairs);
  };
  const handleChangeInputType = (
    optionType: 'text' | 'file',
    pairId: string,
  ) => {
    const index = pairs.findIndex((p) => p.id === pairId);
    const newPairs = [...pairs];
    newPairs[index] = {
      ...newPairs[index],
      inputType: optionType,
      value:
        optionType === 'text'
          ? ''
          : [
              {
                path: '',
                filename: '',
              },
            ],
    };
    setPairs(newPairs);
    savePairs(newPairs);
  };
  const returnFileNames = (values: unknown) => {
    const fileNames = Array.isArray(values)
      ? values
          .map((value: FormDataFile) => value?.filename)
          .filter((filename) => isNonEmptyString(filename))
          .join(', ')
      : '';
    return fileNames;
  };
  return (
    <FormFieldInputContainer>
      {label && <InputLabel>{label}</InputLabel>}
      <StyledContainer>
        {pairs?.map((pair: KeyValuePair) => (
          <StyledKeyValueContainer key={pair.id} readonly={readonly}>
            <StyledKeyInputContainer>
              <StyledSelectInKey>
                <Select
                  dropdownId={pair.id}
                  options={inputTypeOptions}
                  value={pair.inputType}
                  onChange={(value: 'text' | 'file') =>
                    handleChangeInputType(value, pair.id)
                  }
                  disabled={readonly}
                  selectSizeVariant="default"
                  dropdownWidth={70}
                  className="select-container"
                />
              </StyledSelectInKey>
              <StyledKeyInputWrapper>
                <FormTextFieldInput
                  placeholder={keyPlaceholder}
                  readonly={readonly}
                  defaultValue={pair.key || ''}
                  onChange={(value) =>
                    handlePairChange(pair.id, 'key', value ?? '')
                  }
                  VariablePicker={WorkflowVariablePicker}
                />
              </StyledKeyInputWrapper>
            </StyledKeyInputContainer>
            {pair.inputType === 'text' ? (
              <FormTextFieldInput
                placeholder={`select value`}
                readonly={readonly}
                defaultValue={
                  typeof pair.value === 'string' ? (pair.value as string) : ''
                }
                onChange={(value) =>
                  handlePairChange(pair.id, 'value', value ?? '')
                }
                VariablePicker={WorkflowVariablePicker}
              />
            ) : (
              <StyledFileInputWrapper>
                {(() => {
                  const fileNames = returnFileNames(pair.value);
                  const hasFile = fileNames.length > 0;

                  return (
                    <StyledFileNameDisplay hasFile={hasFile}>
                      {hasFile ? fileNames : 'Select file...'}
                    </StyledFileNameDisplay>
                  );
                })()}
                <StyledHiddenFileInput
                  type="file"
                  onChange={(e) =>
                    handleSaveFilePathUploaded(e.target.files, pair.id)
                  }
                  title={(() => {
                    const fileNames = returnFileNames(pair.value);
                    return fileNames.length > 0
                      ? fileNames
                      : 'Click to select file';
                  })()}
                  disabled={readonly}
                />
              </StyledFileInputWrapper>
            )}

            {!readonly && pair.id !== pairs[pairs.length - 1].id ? (
              <Button
                onClick={() => handleRemovePair(pair.id)}
                Icon={IconTrash}
              />
            ) : null}
          </StyledKeyValueContainer>
        ))}
      </StyledContainer>
    </FormFieldInputContainer>
  );
};
