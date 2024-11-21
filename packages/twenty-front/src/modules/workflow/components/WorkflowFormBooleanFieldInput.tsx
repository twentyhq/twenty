import { BooleanInput } from '@/ui/field/input/components/BooleanInput';
import { WorkflowFormFieldInput } from '@/workflow/components/WorkflowFormFieldInput';
import styled from '@emotion/styled';
import { useState } from 'react';

const StyledBooleanInputContainer = styled.div`
  padding-inline: ${({ theme }) => theme.spacing(2)};
`;

type WorkflowFormBooleanFieldInputProps = {
  defaultValue: boolean | string | undefined;
  onPersist: (value: boolean | null | string) => void;
  readonly?: boolean;
};

export const WorkflowFormBooleanFieldInput = ({
  defaultValue,
  onPersist,
  readonly,
}: WorkflowFormBooleanFieldInputProps) => {
  const [draftValue, setDraftValue] = useState(defaultValue ?? false);

  const handleChange = (newValue: boolean) => {
    setDraftValue(newValue);

    onPersist(newValue);
  };

  return (
    <WorkflowFormFieldInput
      variableMode="static-or-variable"
      Input={
        <StyledBooleanInputContainer>
          <BooleanInput
            value={draftValue as boolean}
            readonly={readonly}
            onToggle={(newValue) => {
              handleChange(newValue);
            }}
          />
        </StyledBooleanInputContainer>
      }
      draftValue={draftValue}
      readonly={readonly}
      onUnlinkVariable={() => {
        setDraftValue(false);
        onPersist(false);
      }}
      onVariableTagInsert={(variable) => {
        setDraftValue(variable);
        onPersist(variable);
      }}
    />
  );
};
