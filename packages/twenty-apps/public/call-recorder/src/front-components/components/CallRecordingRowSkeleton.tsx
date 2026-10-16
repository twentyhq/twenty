import { keyframes } from '@emotion/react';
import styled from '@emotion/styled';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import { StyledCallRecordingRowLayout } from 'src/front-components/components/StyledCallRecordingRowLayout';

const pulse = keyframes`
  0%, 100% { opacity: 1; }
  50% { opacity: 0.4; }
`;

const StyledSkeletonBlock = styled.span<{ $width: string }>`
  animation: ${pulse} 1.5s ease-in-out infinite;
  background: ${() => themeCssVariables.background.transparent.light};
  border-radius: ${() => themeCssVariables.border.radius.sm};
  flex-shrink: 0;
  height: ${() => themeCssVariables.spacing[4]};
  width: ${({ $width }) => $width};
`;

const StyledSkeletonSpacer = styled.span`
  flex: 1;
`;

export const CallRecordingRowSkeleton = () => (
  <StyledCallRecordingRowLayout aria-hidden>
    <StyledSkeletonBlock $width="40%" />
    <StyledSkeletonSpacer />
    <StyledSkeletonBlock $width={themeCssVariables.spacing[20]} />
  </StyledCallRecordingRowLayout>
);
