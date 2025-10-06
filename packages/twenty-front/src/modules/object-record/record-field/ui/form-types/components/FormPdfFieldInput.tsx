import { FormFieldInputContainer } from '@/object-record/record-field/ui/form-types/components/FormFieldInputContainer';
import { FormFieldInputRowContainer } from '@/object-record/record-field/ui/form-types/components/FormFieldInputRowContainer';
import { type VariablePickerComponent } from '@/object-record/record-field/ui/form-types/types/VariablePickerComponent';
import { InputErrorHelper } from '@/ui/input/components/InputErrorHelper';
import { InputLabel } from '@/ui/input/components/InputLabel';
import { TextInput } from '@/ui/input/components/TextInput';
import styled from '@emotion/styled';
import { Trans, useLingui } from '@lingui/react/macro';
import { useState } from 'react';
import { IconTrash, IconX } from 'twenty-ui/display';
import { Button } from 'twenty-ui/input';

type FieldPdfFormValue = { attachmentIds: string[] };

type FormPdfFieldInputProps = {
  label?: string;
  error?: string;
  defaultValue: FieldPdfFormValue | null | undefined;
  onChange: (value: FieldPdfFormValue | null) => void;
  readonly?: boolean;
  VariablePicker?: VariablePickerComponent;
  placeholder?: string;
};

const StyledContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(2)};
`;

const StyledIdList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(1)};
  max-height: 200px;
  overflow-y: auto;
`;

const StyledIdRow = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing(1)};
  padding: ${({ theme }) => theme.spacing(1)};
  background: ${({ theme }) => theme.background.secondary};
  border-radius: ${({ theme }) => theme.border.radius.sm};
`;

const StyledIdText = styled.div`
  flex: 1;
  font-size: ${({ theme }) => theme.font.size.sm};
  color: ${({ theme }) => theme.font.color.primary};
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const StyledRemoveButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  padding: ${({ theme }) => theme.spacing(0.5)};
  color: ${({ theme }) => theme.font.color.secondary};
  display: flex;
  align-items: center;
  justify-content: center;
  
  &:hover {
    color: ${({ theme }) => theme.color.red};
  }
  
  &:disabled {
    cursor: not-allowed;
    opacity: 0.5;
  }
`;

const StyledAddRow = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing(1)};
`;

const StyledEmptyState = styled.div`
  padding: ${({ theme }) => theme.spacing(2)};
  text-align: center;
  color: ${({ theme }) => theme.font.color.tertiary};
  border: 1px dashed ${({ theme }) => theme.border.color.medium};
  border-radius: ${({ theme }) => theme.border.radius.sm};
  font-size: ${({ theme }) => theme.font.size.sm};
`;

export const FormPdfFieldInput = ({
  label,
  error,
  defaultValue,
  onChange,
  readonly,
  placeholder,
}: FormPdfFieldInputProps) => {
  const { t } = useLingui();
  const [newId, setNewId] = useState('');
  
  const attachmentIds = defaultValue?.attachmentIds || [];

  const handleAdd = () => {
    if (newId.trim() && !attachmentIds.includes(newId.trim())) {
      onChange({ attachmentIds: [...attachmentIds, newId.trim()] });
      setNewId('');
    }
  };

  const handleRemove = (idToRemove: string) => {
    onChange({
      attachmentIds: attachmentIds.filter((id) => id !== idToRemove),
    });
  };

  const handleClear = () => {
    onChange({ attachmentIds: [] });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAdd();
    }
  };

  return (
    <FormFieldInputContainer>
      {label ? <InputLabel>{label}</InputLabel> : null}

      <FormFieldInputRowContainer>
        <StyledContainer>
          {!readonly && (
            <StyledAddRow>
              <TextInput
                value={newId}
                onChange={(value: string) => setNewId(value)}
                placeholder={placeholder || t`Enter attachment ID`}
                onKeyDown={handleKeyDown}
                fullWidth
              />
              <Button
                title={t`Add`}
                onClick={handleAdd}
                disabled={!newId.trim()}
                size="small"
                variant="secondary"
              />
              {attachmentIds.length > 0 && (
                <Button
                  Icon={IconTrash}
                  title={t`Clear All`}
                  onClick={handleClear}
                  size="small"
                  variant="secondary"
                />
              )}
            </StyledAddRow>
          )}

          {attachmentIds.length === 0 ? (
            <StyledEmptyState>
              <Trans>No attachment IDs specified</Trans>
            </StyledEmptyState>
          ) : (
            <StyledIdList>
              {attachmentIds.map((id) => (
                <StyledIdRow key={id}>
                  <StyledIdText title={id}>{id}</StyledIdText>
                  {!readonly && (
                    <StyledRemoveButton
                      onClick={() => handleRemove(id)}
                      disabled={readonly}
                    >
                      <IconX size={16} />
                    </StyledRemoveButton>
                  )}
                </StyledIdRow>
              ))}
            </StyledIdList>
          )}
        </StyledContainer>
      </FormFieldInputRowContainer>

      {error && <InputErrorHelper>{error}</InputErrorHelper>}
    </FormFieldInputContainer>
  );
};
