import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { Key } from 'ts-key-enum';

import { TextInput } from '@/ui/input/components/TextInput';
import { useHotkeysOnFocusedElement } from '@/ui/utilities/hotkey/hooks/useHotkeysOnFocusedElement';
import { Button } from 'twenty-ui/input';
import { themeCssVariables } from 'twenty-ui/theme-constants';

const StyledContainer = styled.div`
  align-items: center;
  display: flex;
  gap: ${themeCssVariables.spacing[1]};
  padding: ${themeCssVariables.spacing[1]};
  width: 100%;
  box-sizing: border-box;
`;

type FieldsConfigurationGroupRenameInputProps = {
  dropdownId: string;
  renameValue: string;
  onRenameValueChange: (value: string) => void;
  onSave: (newName: string) => void;
  onCancel: () => void;
};

export const FieldsConfigurationGroupRenameInput = ({
  dropdownId,
  renameValue,
  onRenameValueChange,
  onSave,
  onCancel,
}: FieldsConfigurationGroupRenameInputProps) => {
  const { t } = useLingui();

  const handleSave = () => {
    if (renameValue.trim().length > 0) {
      onSave(renameValue.trim());
    }
    onCancel();
  };

  useHotkeysOnFocusedElement({
    keys: [Key.Enter],
    callback: handleSave,
    focusId: dropdownId,
    dependencies: [handleSave],
  });

  useHotkeysOnFocusedElement({
    keys: [Key.Escape],
    callback: onCancel,
    focusId: dropdownId,
    dependencies: [onCancel],
  });

  return (
    <StyledContainer>
      <TextInput
        value={renameValue}
        onChange={onRenameValueChange}
        autoFocus
        fullWidth
        sizeVariant="sm"
        placeholder={t`Group name`}
      />
      <Button
        variant="primary"
        accent="blue"
        size="small"
        title="Done"
        onClick={handleSave}
      />
    </StyledContainer>
  );
};
