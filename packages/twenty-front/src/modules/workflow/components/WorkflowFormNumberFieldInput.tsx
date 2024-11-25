import { TextInput } from '@/ui/field/input/components/TextInput';
import { WorkflowFormFieldInputBase } from '@/workflow/components/WorkflowFormFieldInputBase';
import styled from '@emotion/styled';
import { useId, useState } from 'react';
import {
  canBeCastAsNumberOrNull,
  castAsNumberOrNull,
} from '~/utils/cast-as-number-or-null';

const StyledInput = styled(TextInput)`
  padding: ${({ theme }) => `${theme.spacing(1)} ${theme.spacing(2)}`};
`;

type WorkflowFormNumberFieldInputProps = {
  label?: string;
  placeholder: string;
  defaultValue: number | string | undefined;
  onPersist: (value: number | null | string) => void;
};

export const WorkflowFormNumberFieldInput = ({
  label,
  placeholder,
  defaultValue,
  onPersist,
}: WorkflowFormNumberFieldInputProps) => {
  const inputId = useId();

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
    <WorkflowFormFieldInputBase
      inputId={inputId}
      label={label}
      variableMode="static-or-variable"
      Input={
        <StyledInput
          inputId={inputId}
          placeholder={placeholder}
          value={String(draftValue)}
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
