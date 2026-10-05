import { t } from '@lingui/core/macro';
import { styled } from '@linaria/react';

import { IconX } from 'twenty-ui/icon';
import { IconButton } from 'twenty-ui/components';

const StyledCloseButtonContainer = styled.div`
  align-items: center;
  aspect-ratio: 1;
  display: flex;
  height: 60px;
  justify-content: center;
  position: absolute;
  right: 0;
  top: 0;
`;

type SpreadSheetImportModalCloseButtonProps = {
  onClose: () => void;
};

export const SpreadSheetImportModalCloseButton = ({
  onClose,
}: SpreadSheetImportModalCloseButtonProps) => {
  return (
    <StyledCloseButtonContainer>
      <IconButton aria-label={t`Close import`} onClick={onClose}>
        <IconX />
      </IconButton>
    </StyledCloseButtonContainer>
  );
};
