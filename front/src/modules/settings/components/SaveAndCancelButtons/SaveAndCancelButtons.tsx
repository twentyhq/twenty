import styled from '@emotion/styled';

import { CancelButton } from './CancelButton';
import { SaveButton } from './SaveButton';

const StyledContainer = styled.div`
  align-items: center;
  display: flex;
  gap: ${({ theme }) => theme.spacing(1)};
`;

type SaveAndCancelButtonsProps = {
  onSave?: () => void;
  onCancel?: () => void;
  disabled?: boolean;
};

export const SaveAndCancelButtons = ({
  onSave,
  onCancel,
  disabled,
}: SaveAndCancelButtonsProps) => {
  return (
    <StyledContainer>
      <CancelButton onClick={onCancel} />
      <SaveButton onClick={onSave} disabled={disabled} />
    </StyledContainer>
  );
};
