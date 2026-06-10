import { styled } from '@linaria/react';

import { IconX } from 'twenty-ui-deprecated/display';
import { IconButton } from 'twenty-ui-deprecated/input';

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
      <IconButton Icon={IconX} onClick={onClose} />
    </StyledCloseButtonContainer>
  );
};
