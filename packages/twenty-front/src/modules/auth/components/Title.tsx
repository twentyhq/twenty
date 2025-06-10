import styled from '@emotion/styled';
import React from 'react';
import { AnimatedEaseIn } from 'twenty-ui/utilities';

type TitleProps = React.PropsWithChildren & {
  animate?: boolean;
  noMarginTop?: boolean;
};

const StyledTitle = styled.div<Pick<TitleProps, 'noMarginTop'>>`
  color: ${({ theme }) => theme.font.color.primary};
  font-size: ${({ theme }) => theme.font.size.xl};
  font-weight: ${({ theme }) => theme.font.weight.semiBold};
  margin-bottom: ${({ theme }) => theme.spacing(4)};
  margin-top: ${({ theme, noMarginTop }) =>
    !noMarginTop ? theme.spacing(4) : 0};
`;

export const Title = ({
  children,
  animate = false,
  noMarginTop = false,
}: TitleProps) => {
  if (animate) {
    return (
      <StyledTitle noMarginTop={noMarginTop}>
        <AnimatedEaseIn>{children}</AnimatedEaseIn>
      </StyledTitle>
    );
  }

  return <StyledTitle noMarginTop={noMarginTop}>{children}</StyledTitle>;
};
