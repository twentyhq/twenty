import styled from '@emotion/styled';
import { ReactElement } from 'react';

const StyledBox = styled.div<{ isInRightDrawer?: boolean }>`
  height: ${({ isInRightDrawer }) => (isInRightDrawer ? 'auto' : '100%')};

  margin: ${({ isInRightDrawer, theme }) =>
    isInRightDrawer ? theme.spacing(4) : ''};
`;

type TraceableCardContainerProps = {
  children: ReactElement[] | ReactElement;
  isInRightDrawer?: boolean;
};

export const TraceableCardContainer = ({
  children,
  isInRightDrawer = true,
}: TraceableCardContainerProps) => {
  return <StyledBox isInRightDrawer={isInRightDrawer}>{children}</StyledBox>;
};
