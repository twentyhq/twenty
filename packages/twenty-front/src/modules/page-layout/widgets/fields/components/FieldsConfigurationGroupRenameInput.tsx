import styled from '@emotion/styled';
import { useLingui } from '@lingui/react/macro';
import { useRef } from 'react';

import { DropdownMenuInput } from '@/ui/layout/dropdown/components/DropdownMenuInput';
import { LightButton } from 'twenty-ui/input';

const StyledContainer = styled.div`
  display: flex;
  align-items: center;
  width: 100%;
`;

type FieldsConfigurationGroupRenameInputProps = {
  renameValue: string;
  onRenameValueChange: (value: string) => void;
  onSave: (newName: string) => void;
  onCancel: () => void;
};

export const FieldsConfigurationGroupRenameInput = ({
  renameValue,
  onRenameValueChange,
  onSave,
  onCancel,
}: FieldsConfigurationGroupRenameInputProps) => {
  const { t } = useLingui();

  const inputRef = useRef<HTMLInputElement>(null);

  const handleSave = () => {
    if (renameValue.trim().length > 0) {
      onSave(renameValue.trim());
    }
    onCancel();
  };

  const handleCancel = () => {
    onCancel();
  };

  return (
    <StyledContainer>
      <DropdownMenuInput
        ref={inputRef}
        instanceId="fields-configuration-group-rename"
        value={renameValue}
        onChange={(e) => onRenameValueChange(e.target.value)}
        onEnter={handleSave}
        onEscape={handleCancel}
        autoFocus
        rightComponent={
          <LightButton
            title={t`Done`}
            accent="secondary"
            onClick={handleSave}
          />
        }
      />
    </StyledContainer>
  );
};
