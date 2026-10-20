import { keyframes } from '@emotion/react';
import styled from '@emotion/styled';
import { themeCssVariables } from 'twenty-ui/theme-constants';

const shimmer = keyframes`
  from { transform: translateX(-100%); }
  to { transform: translateX(100%); }
`;

export const StyledWidgetSkeleton = styled.div<{ $height: string }>`
  background-color: ${() => themeCssVariables.background.tertiary};
  border-radius: ${() => themeCssVariables.border.radius.md};
  height: ${({ $height }) => $height};
  overflow: hidden;
  position: relative;
  width: 100%;

  &::after {
    animation: ${shimmer} 1.5s ease-in-out infinite;
    background-image: linear-gradient(
      90deg,
      ${() => themeCssVariables.background.tertiary} 0%,
      ${() => themeCssVariables.background.transparent.lighter} 50%,
      ${() => themeCssVariables.background.tertiary} 100%
    );
    content: '';
    inset: 0;
    position: absolute;
    transform: translateX(-100%);
  }

  @media (prefers-reduced-motion: reduce) {
    &::after {
      display: none;
    }
  }
`;
