import { FormFieldInputBase } from '@/object-record/record-field/form-types/components/FormFieldInputBase';
import { TextInput } from '@/ui/field/input/components/TextInput';
import styled from '@emotion/styled';
import { useState } from 'react';
import {
  canBeCastAsNumberOrNull,
  castAsNumberOrNull,
} from '~/utils/cast-as-number-or-null';

const StyledInput = styled(TextInput)`
  padding: ${({ theme }) => `${theme.spacing(1)} ${theme.spacing(2)}`};
`;

type FormNumberFieldInputProps = {
  placeholder: string;
  defaultValue: number | string | undefined;
  onPersist: (value: number | null | string) => void;
};

export const FormNumberFieldInput = ({
  placeholder,
  defaultValue,
  onPersist,
}: FormNumberFieldInputProps) => {
  const [draftValue, setDraftValue] = useState(defaultValue ?? '');

  const persistNumber = (newValue: string) => {
    if (!canBeCastAsNumberOrNull(newValue)) {
      return;
    }

    const castedValue = castAsNumberOrNull(newValue);

    onPersist(castedValue);
  };

  const handleChange = (newText: string) => {
    setDraftValue(newText);

    persistNumber(newText.trim());
  };

  return (
    <FormFieldInputBase
      Input={
        <StyledInput
          placeholder={placeholder}
          value={String(draftValue)}
          copyButton={false}
          hotkeyScope="record-create"
          onChange={(value) => {
            handleChange(value);
          }}
        />
      }
    />
  );
};
