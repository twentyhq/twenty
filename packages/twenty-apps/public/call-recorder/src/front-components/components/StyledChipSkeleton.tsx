import { keyframes } from '@emotion/react';
import styled from '@emotion/styled';
import { themeCssVariables } from 'twenty-ui/theme-constants';

const shimmer = keyframes`
  from { transform: translateX(-100%); }
  to { transform: translateX(100%); }
`;

export const StyledChipSkeleton = styled.span<{ $width: string }>`
  background-color: ${() => themeCssVariables.background.tertiary};
  border-radius: ${() => themeCssVariables.border.radius.md};
  display: block;
  flex-shrink: 0;
  height: ${() => themeCssVariables.spacing[5]};
  overflow: hidden;
  position: relative;
  width: ${({ $width }) => $width};

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
