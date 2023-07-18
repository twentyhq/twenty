import React from 'react';
import styled from '@emotion/styled';

import { AnimatedTextWord } from '@/ui/components/motion/AnimatedTextWord';

type Props = React.PropsWithChildren & {
  animate?: boolean;
};

const StyledTitle = styled.div`
  color: ${({ theme }) => theme.font.color.primary};
  font-size: ${({ theme }) => theme.font.size.xl};
  font-weight: ${({ theme }) => theme.font.weight.semiBold};
`;

const StyledAnimatedTextWord = styled(AnimatedTextWord)`
  color: ${({ theme }) => theme.font.color.primary};
  font-size: ${({ theme }) => theme.font.size.xl};
  font-weight: ${({ theme }) => theme.font.weight.semiBold};
`;

export function Title({ children, animate = false }: Props) {
  if (animate && typeof children === 'string') {
    return <StyledAnimatedTextWord text={children} />;
  }

  return <StyledTitle>{children}</StyledTitle>;
}
