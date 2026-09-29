import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { isNonEmptyString } from '@sniptt/guards';
import { type FormEvent } from 'react';

import { TextInput } from '@/ui/input/components/TextInput';
import { Button } from 'twenty-ui/primitives/input';
import { themeCssVariables } from 'twenty-ui/theme';

const StyledForm = styled.form`
  align-items: center;
  box-sizing: border-box;
  display: flex;
  gap: ${themeCssVariables.spacing[1]};
  padding: ${themeCssVariables.spacing[1]};
  width: 100%;
`;

type FieldsConfigurationGroupRenameInputProps = {
  renameValue: string;
  onRenameValueChange: (value: string) => void;
  onSave: (newName: string) => void;
  onClose: () => void;
};

export const FieldsConfigurationGroupRenameInput = ({
  renameValue,
  onRenameValueChange,
  onSave,
  onClose,
}: FieldsConfigurationGroupRenameInputProps) => {
  const { t } = useLingui();

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const trimmedRenameValue = renameValue.trim();

    if (isNonEmptyString(trimmedRenameValue)) {
      onSave(trimmedRenameValue);
    }

    onClose();
  };

  return (
    <StyledForm onSubmit={handleSubmit}>
      <TextInput
        value={renameValue}
        onChange={onRenameValueChange}
        autoFocus
        fullWidth
        sizeVariant="sm"
        placeholder={t`Group name`}
        aria-label={t`Group name`}
      />
      <Button type="submit" size="sm" variant="solid" color="accent">
        {t`Done`}
      </Button>
    </StyledForm>
  );
};
