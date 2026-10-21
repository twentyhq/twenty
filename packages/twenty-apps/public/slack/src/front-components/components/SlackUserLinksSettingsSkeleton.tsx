import { keyframes } from '@emotion/react';
import styled from '@emotion/styled';
import { themeCssVariables } from 'twenty-ui/theme-constants';

const SKELETON_ROW_COUNT = 5;

const shimmer = keyframes`
  to { transform: translateX(100%); }
`;

const StyledContainer = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
`;

const StyledDescription = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${() => themeCssVariables.spacing[1]};
  margin-bottom: ${() => themeCssVariables.spacing[6]};
  margin-top: ${() => themeCssVariables.spacing[2]};
`;

const StyledRows = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${() => themeCssVariables.spacing[1]};
`;

const StyledBar = styled.span<{ width: string; height: string }>`
  background-color: ${() => themeCssVariables.background.tertiary};
  border-radius: ${() => themeCssVariables.border.radius.sm};
  display: block;
  height: ${({ height }) => height};
  overflow: hidden;
  position: relative;
  width: ${({ width }) => width};

  &::after {
    animation: ${shimmer} 1.5s ease-in-out infinite;
    background-image: linear-gradient(
      90deg,
      ${() => themeCssVariables.background.tertiary} 0%,
      ${() => themeCssVariables.background.transparent.lighter} 50%,
      ${() => themeCssVariables.background.tertiary} 100%
    );
    content: ' ';
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

// Mirrors the host's SettingsApplicationCustomSettingsSkeletonLoader so the
// hand-off from host to app reads as one skeleton.
export const SlackUserLinksSettingsSkeleton = () => (
  <StyledContainer aria-busy="true" aria-label="Loading Slack user links">
    <StyledBar width="140px" height="16px" />
    <StyledDescription>
      <StyledBar width="100%" height="13px" />
      <StyledBar width="60%" height="13px" />
    </StyledDescription>
    <StyledRows>
      {Array.from({ length: SKELETON_ROW_COUNT }, (_, index) => (
        <StyledBar key={index} width="100%" height="32px" />
      ))}
    </StyledRows>
  </StyledContainer>
);
