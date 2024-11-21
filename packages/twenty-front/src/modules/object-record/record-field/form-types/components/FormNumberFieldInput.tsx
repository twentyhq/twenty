import { FormFieldInput } from '@/object-record/record-field/form-types/components/FormFieldInput';
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
  defaultValue: string | undefined;
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
    <FormFieldInput
      variableMode="static-or-variable"
      Input={
        <StyledInput
          placeholder={placeholder}
          value={draftValue}
          copyButton={false}
          hotkeyScope="record-create"
          onChange={(value) => {
            handleChange(value);
          }}
        />
      }
      draftValue={draftValue}
      onUnlinkVariable={() => {
        setDraftValue('');
        onPersist(null);
      }}
      onVariableTagInsert={(variable) => {
        setDraftValue(variable);
        onPersist(variable);
      }}
    />
  );
};
