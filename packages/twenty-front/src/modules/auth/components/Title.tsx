import React from 'react';
import styled from '@emotion/styled';

import { AnimatedEaseIn } from '@/ui/utilities/animation/components/AnimatedEaseIn';

type TitleProps = React.PropsWithChildren & {
  animate?: boolean;
  withMarginTop?: boolean;
};

const StyledTitle = styled.div<Pick<TitleProps, 'withMarginTop'>>`
  color: ${({ theme }) => theme.font.color.primary};
  font-size: ${({ theme }) => theme.font.size.xl};
  font-weight: ${({ theme }) => theme.font.weight.semiBold};
  margin-bottom: ${({ theme }) => theme.spacing(4)};
  margin-top: ${({ theme, withMarginTop }) =>
    withMarginTop ? theme.spacing(4) : 0};
`;

export const Title = ({
  children,
  animate = false,
  withMarginTop = true,
}: TitleProps) => {
  if (animate) {
    return (
      <StyledTitle withMarginTop={withMarginTop}>
        <AnimatedEaseIn>{children}</AnimatedEaseIn>
      </StyledTitle>
    );
  }

  return <StyledTitle withMarginTop={withMarginTop}>{children}</StyledTitle>;
};
