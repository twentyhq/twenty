import { keyframes } from '@emotion/react';
import styled from '@emotion/styled';
import { isDefined } from 'twenty-sdk/utils';
import { themeCssVariables } from 'twenty-ui/theme-constants';

const shimmer = keyframes`
  100% {
    transform: translateX(100%);
  }
`;

export const StyledSkeletonBlock = styled.div<{
  $width?: number;
  $height: number;
  $isCircle?: boolean;
}>`
  background-color: ${() => themeCssVariables.background.tertiary};
  border-radius: ${({ $isCircle }) =>
    $isCircle ? '50%' : themeCssVariables.border.radius.sm};
  flex: ${({ $width }) => (isDefined($width) ? '0 0 auto' : '1')};
  height: ${({ $height }) => $height}px;
  overflow: hidden;
  position: relative;
  width: ${({ $width }) => (isDefined($width) ? `${$width}px` : 'auto')};

  &::after {
    animation: ${shimmer} 1.5s ease-in-out infinite;
    background-image: linear-gradient(
      90deg,
      transparent,
      ${() => themeCssVariables.background.transparent.lighter},
      transparent
    );
    content: '';
    inset: 0;
    position: absolute;
    transform: translateX(-100%);
  }
`;
