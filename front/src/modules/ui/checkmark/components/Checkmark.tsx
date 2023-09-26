import React from 'react';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';

import { IconCheck } from '@/ui/icon';

const StyledContainer = styled.div`
  align-items: center;
  background-color: ${({ theme }) => theme.color.blue};
  border-radius: 50%;
  display: flex;
  height: 20px;
  justify-content: center;
  width: 20px;
`;

export type CheckmarkProps = React.ComponentPropsWithoutRef<'div'>;

export const Checkmark = (props: CheckmarkProps) => {
  const theme = useTheme();

  return (
    // eslint-disable-next-line twenty/no-spread-props
    <StyledContainer {...props}>
      <IconCheck color={theme.grayScale.gray0} size={14} />
    </StyledContainer>
  );
};
