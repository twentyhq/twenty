import styled from '@emotion/styled';
import type { IconComponent } from 'twenty-ui/display';

import { CancelButton } from './CancelButton';
import { SaveButton } from './SaveButton';

const StyledContainer = styled.div`
  align-items: center;
  display: flex;
  gap: ${({ theme }) => theme.spacing(1)};
`;

type SaveAndCancelButtonsProps = {
  onSave?: () => void;
  isLoading?: boolean;
  onCancel?: () => void;
  isSaveDisabled?: boolean;
  isCancelDisabled?: boolean;
  inverted?: boolean;
  saveIcon?: IconComponent;
};

export const SaveAndCancelButtons = ({
  onSave,
  isLoading,
  onCancel,
  isSaveDisabled,
  isCancelDisabled,
  inverted = false,
  saveIcon,
}: SaveAndCancelButtonsProps) => {
  return (
    <StyledContainer>
      <CancelButton
        onCancel={onCancel}
        disabled={isCancelDisabled}
        inverted={inverted}
      />
      <SaveButton
        onSave={onSave}
        disabled={isSaveDisabled}
        isLoading={isLoading}
        inverted={inverted}
        saveIcon={saveIcon}
      />
    </StyledContainer>
  );
};
