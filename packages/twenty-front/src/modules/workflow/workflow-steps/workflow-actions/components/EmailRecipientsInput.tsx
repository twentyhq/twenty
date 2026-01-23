import { FormFieldInputContainer } from '@/object-record/record-field/ui/form-types/components/FormFieldInputContainer';
import { FormTextFieldInput } from '@/object-record/record-field/ui/form-types/components/FormTextFieldInput';
import { InputLabel } from '@/ui/input/components/InputLabel';
import { extractNonEmptyEmails } from '@/workflow/workflow-steps/workflow-actions/email-action/utils/extractNonEmptyEmails';
import { WorkflowVariablePicker } from '@/workflow/workflow-variables/components/WorkflowVariablePicker';
import styled from '@emotion/styled';
import { t } from '@lingui/core/macro';
import { useState } from 'react';
import { IconTrash } from 'twenty-ui/display';
import { Button } from 'twenty-ui/input';
import { v4 } from 'uuid';

const StyledContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(2)};
`;

const StyledEmailRow = styled.div<{ readonly: boolean | undefined }>`
  display: grid;
  gap: ${({ theme }) => theme.spacing(2)};
  grid-template-columns: ${({ readonly, theme }) =>
    readonly ? '1fr' : `1fr ${theme.spacing(8)}`};
`;

type EmailEntry = {
  id: string;
  value: string;
};

type EmailRecipientsInputProps = {
  label: string;
  defaultValue: string[];
  onChange: (emails: string[]) => void;
  readonly?: boolean;
  placeholder?: string;
};

export const EmailRecipientsInput = ({
  label,
  defaultValue,
  onChange,
  readonly,
  placeholder,
}: EmailRecipientsInputProps) => {
  const [entries, setEntries] = useState<EmailEntry[]>(() => {
    const initial = defaultValue.map((email) => ({ id: v4(), value: email }));
    return initial.length > 0
      ? [...initial, { id: v4(), value: '' }]
      : [{ id: v4(), value: '' }];
  });

  const handleEntryChange = (entryId: string, newValue: string) => {
    const index = entries.findIndex((entry) => entry.id === entryId);
    const newEntries = [...entries];

    newEntries[index] = { ...newEntries[index], value: newValue };

    const isLastEntry = entryId === entries[entries.length - 1].id;

    if (isLastEntry && newValue.trim().length > 0) {
      newEntries.push({ id: v4(), value: '' });
    }

    setEntries(newEntries);
    onChange(extractNonEmptyEmails(newEntries));
  };

  const handleRemoveEntry = (entryId: string) => {
    const newEntries = entries.filter((entry) => entry.id !== entryId);

    if (newEntries.length === 0) {
      newEntries.push({ id: v4(), value: '' });
    }

    setEntries(newEntries);
    onChange(extractNonEmptyEmails(newEntries));
  };

  return (
    <FormFieldInputContainer>
      <InputLabel>{label}</InputLabel>
      <StyledContainer>
        {entries.map((entry) => {
          const isLastEntry = entry.id === entries[entries.length - 1].id;

          return (
            <StyledEmailRow key={entry.id} readonly={readonly}>
              <FormTextFieldInput
                placeholder={placeholder ?? t`Enter email address`}
                readonly={readonly}
                defaultValue={entry.value}
                onChange={(value) => handleEntryChange(entry.id, value ?? '')}
                VariablePicker={WorkflowVariablePicker}
              />
              {!readonly &&
                (isLastEntry ? (
                  <Button Icon={IconTrash} disabled={true} />
                ) : (
                  <Button
                    onClick={() => handleRemoveEntry(entry.id)}
                    Icon={IconTrash}
                  />
                ))}
            </StyledEmailRow>
          );
        })}
      </StyledContainer>
    </FormFieldInputContainer>
  );
};
