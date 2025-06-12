import { FormFieldInputContainer } from '@/object-record/record-field/form-types/components/FormFieldInputContainer';
import { FormTextFieldInput } from '@/object-record/record-field/form-types/components/FormTextFieldInput';
import { VariablePickerComponent } from '@/object-record/record-field/form-types/types/VariablePickerComponent';
import { InputLabel } from '@/ui/input/components/InputLabel';
import styled from '@emotion/styled';
import { useEffect, useState } from 'react';
import { IconTrash } from 'twenty-ui/display';
import { IconButton } from 'twenty-ui/input';

const StyledContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(2)};
`;

const StyledRow = styled.div`
  align-items: flex-start;
  display: flex;
  gap: ${({ theme }) => theme.spacing(2)};
`;

const StyledKeyValueContainer = styled.div`
  display: flex;
  flex: 1;
  gap: ${({ theme }) => theme.spacing(2)};
`;

const StyledPlaceholder = styled.div`
  aspect-ratio: 1;
  height: ${({ theme }) => theme.spacing(8)};
`;

type KeyValuePair = {
  key: string;
  value: string;
};

type KeyValuePairInputProps = {
  label?: string;
  defaultValue?: Record<string, string>;
  onChange: (value: Record<string, string>) => void;
  readonly?: boolean;
  VariablePicker?: VariablePickerComponent;
  error?: string;
  onBlur?: () => void;
};

export const KeyValuePairInput = ({
  label,
  defaultValue = {},
  onChange,
  readonly,
  VariablePicker,
  error,
  onBlur,
}: KeyValuePairInputProps) => {
  const [pairs, setPairs] = useState<KeyValuePair[]>(() => {
    const initialPairs = Object.entries(defaultValue).map(([key, value]) => ({
      key,
      value,
    }));
    return initialPairs.length > 0
      ? [...initialPairs, { key: '', value: '' }]
      : [{ key: '', value: '' }];
  });

  useEffect(() => {
    const newPairs = Object.entries(defaultValue).map(([key, value]) => ({
      key,
      value,
    }));
    setPairs(
      newPairs.length > 0
        ? [...newPairs, { key: '', value: '' }]
        : [{ key: '', value: '' }],
    );
  }, [defaultValue]);

  const handlePairChange = (
    index: number,
    field: 'key' | 'value',
    newValue: string,
  ) => {
    const newPairs = [...pairs];
    newPairs[index] = { ...newPairs[index], [field]: newValue };

    if (
      index === pairs.length - 1 &&
      (field === 'key' || field === 'value') &&
      Boolean(newValue.trim())
    ) {
      newPairs.push({ key: '', value: '' });
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

  const handleRemovePair = (index: number) => {
    const newPairs = pairs.filter((_, i) => i !== index);
    if (newPairs.length === 0) {
      newPairs.push({ key: '', value: '' });
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
        {pairs.map((pair, index) => (
          <StyledRow key={index}>
            <StyledKeyValueContainer>
              <FormTextFieldInput
                placeholder="Header name"
                readonly={readonly}
                defaultValue={pair.key}
                onChange={(value) =>
                  handlePairChange(index, 'key', value ?? '')
                }
                VariablePicker={VariablePicker}
              />
              <FormTextFieldInput
                placeholder="Header value"
                readonly={readonly}
                defaultValue={pair.value}
                onChange={(value) =>
                  handlePairChange(index, 'value', value ?? '')
                }
                VariablePicker={VariablePicker}
              />
              {!readonly && index !== pairs.length - 1 ? (
                <IconButton
                  onClick={() => handleRemovePair(index)}
                  variant="tertiary"
                  size="medium"
                  Icon={IconTrash}
                />
              ) : (
                <StyledPlaceholder />
              )}
            </StyledKeyValueContainer>
          </StyledRow>
        ))}
      </StyledContainer>
    </FormFieldInputContainer>
  );
};
