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
  isSaveDisabled?: boolean;
};

export const SaveAndCancelButtons = ({
  onSave,
  onCancel,
  isSaveDisabled,
}: SaveAndCancelButtonsProps) => {
  return (
    <StyledContainer>
      <CancelButton onCancel={onCancel} />
      <SaveButton onSave={onSave} disabled={isSaveDisabled} />
    </StyledContainer>
  );
};
