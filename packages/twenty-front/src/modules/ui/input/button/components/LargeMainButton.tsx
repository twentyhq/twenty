import React from 'react';
import styled from '@emotion/styled';

import { MainButton } from '@/ui/input/button/components/MainButton.tsx';
const StyledButtonContainer = styled.div`
  margin-top: ${({ theme }) => theme.spacing(8)};
  width: 200px;
`;

type LargeMainButtonProps = {
  title: string;
} & React.ComponentProps<'button'>;
export const LargeMainButton = ({
  title,
  onClick,
  disabled,
}: LargeMainButtonProps) => {
  return (
    <StyledButtonContainer>
      <MainButton
        title={title}
        onClick={onClick}
        disabled={disabled}
        fullWidth
      />
    </StyledButtonContainer>
  );
};
