import { FormFieldInputContainer } from '@/object-record/record-field/ui/form-types/components/FormFieldInputContainer';
import { FormTextFieldInput } from '@/object-record/record-field/ui/form-types/components/FormTextFieldInput';
import { InputLabel } from '@/ui/input/components/InputLabel';
import { type KeyValuePair } from '@/workflow/workflow-steps/workflow-actions/http-request-action/hooks/useKeyValuePairs';
import { WorkflowVariablePicker } from '@/workflow/workflow-variables/components/WorkflowVariablePicker';
import { css } from '@emotion/react';
import styled from '@emotion/styled';
import { isDefined } from 'twenty-shared/utils';
import { IconTrash } from 'twenty-ui/display';
import { Button } from 'twenty-ui/input';
import { v4 } from 'uuid';

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

export type KeyValuePairInputProps = {
  label?: string;
  defaultValue?: Record<string, string> | Array<string>;
  onChange: (value: Record<string, string>) => void;
  readonly?: boolean;
  keyPlaceholder?: string;
  valuePlaceholder?: string;
  uniqueNotEditableKeys?: string[];
  pairs: KeyValuePair[];
  setPairs: (value: KeyValuePair[]) => void;
};

export const KeyValuePairInput = ({
  label,
  onChange,
  readonly,
  keyPlaceholder = 'Key',
  valuePlaceholder = 'Value',
  uniqueNotEditableKeys,
  pairs,
  setPairs,
}: KeyValuePairInputProps) => {
  const handlePairChange = (
    pairId: string,
    field: 'key' | 'value',
    newValue: string,
  ) => {
    const index = pairs.findIndex((p) => p.id === pairId);
    const newPairs = [...pairs];
    if (field === 'key' && uniqueNotEditableKeys?.includes(newValue.trim())) {
      newPairs.splice(index, 1);
    } else {
      newPairs[index] = { ...newPairs[index], [field]: newValue };
    }
    if (
      index === pairs.length - 1 &&
      (field === 'key' || field === 'value') &&
      Boolean(newValue.trim())
    ) {
      newPairs.push({ id: v4(), key: '', value: '' });
    }

    setPairs(newPairs);

    const record = newPairs.reduce(
      (acc, { key, value }) => {
        if (key.trim().length > 0) {
          acc[key] = value;
        }
        return acc;
      },
      {} as Record<string, string>,
    );

    onChange(record);
  };

  const handleRemovePair = (pairId: string) => {
    const pairToRemove = pairs.find((p) => p.id === pairId);

    if (
      isDefined(pairToRemove) &&
      uniqueNotEditableKeys?.includes(pairToRemove?.key.trim())
    ) {
      return;
    }
    const newPairs = pairs.filter((pair) => pair.id !== pairId);
    if (
      newPairs.length === 0 ||
      (newPairs.length === uniqueNotEditableKeys?.length &&
        newPairs.every((pair) =>
          uniqueNotEditableKeys.includes(pair.key.trim()),
        ))
    ) {
      newPairs.push({ id: v4(), key: '', value: '' });
    }
    setPairs(newPairs);

    const record = newPairs.reduce(
      (acc, { key, value }) => {
        if (key.trim().length > 0) {
          acc[key] = value;
        }
        return acc;
      },
      {} as Record<string, string>,
    );

    onChange(record);
  };

  return (
    <FormFieldInputContainer>
      {label && <InputLabel>{label}</InputLabel>}
      <StyledContainer>
        {pairs.map(
          (pair) =>
            !uniqueNotEditableKeys?.includes(pair.key) && (
              <StyledKeyValueContainer key={pair.id} readonly={readonly}>
                <FormTextFieldInput
                  placeholder={keyPlaceholder}
                  readonly={readonly}
                  defaultValue={pair.key}
                  onChange={(value) =>
                    handlePairChange(pair.id, 'key', value ?? '')
                  }
                  VariablePicker={WorkflowVariablePicker}
                />

                <FormTextFieldInput
                  placeholder={valuePlaceholder}
                  readonly={readonly}
                  defaultValue={pair.value}
                  onChange={(value) =>
                    handlePairChange(pair.id, 'value', value ?? '')
                  }
                  VariablePicker={WorkflowVariablePicker}
                />

                {!readonly && pair.id !== pairs[pairs.length - 1].id ? (
                  <Button
                    onClick={() => handleRemovePair(pair.id)}
                    Icon={IconTrash}
                  />
                ) : null}
              </StyledKeyValueContainer>
            ),
        )}
      </StyledContainer>
    </FormFieldInputContainer>
  );
};
