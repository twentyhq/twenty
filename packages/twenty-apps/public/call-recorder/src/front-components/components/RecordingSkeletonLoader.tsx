// Mirrors the twenty-front skeleton standard (react-loading-skeleton themed
// with background.tertiary / background.transparent.lighter) using emotion,
// since the sandboxed front-component bundle cannot import the host's
// global skeleton stylesheet.
import { keyframes } from '@emotion/react';
import styled from '@emotion/styled';

import { recordingThemeCssVariables } from 'src/front-components/constants/recording-theme-css-variables';

const SKELETON_ENTRY_COUNT = 3;
const SKELETON_BAR_HEIGHT = '16px';
const SKELETON_BORDER_RADIUS = '4px';

const skeletonHighlightSweep = keyframes`
  100% {
    transform: translateX(100%);
  }
`;

const StyledSkeletonBar = styled.div`
  background-color: ${recordingThemeCssVariables.background.tertiary};
  border-radius: ${SKELETON_BORDER_RADIUS};
  height: ${SKELETON_BAR_HEIGHT};
  overflow: hidden;
  position: relative;

  &::after {
    animation: ${skeletonHighlightSweep} 1.5s ease-in-out infinite;
    background-image: linear-gradient(
      90deg,
      transparent,
      ${recordingThemeCssVariables.background.transparentLighter},
      transparent
    );
    content: '';
    inset: 0;
    position: absolute;
    transform: translateX(-100%);
  }
`;

const StyledSkeletonAvatar = styled(StyledSkeletonBar)`
  border-radius: 50px;
  flex-shrink: 0;
  width: ${SKELETON_BAR_HEIGHT};
`;

const StyledSkeletonSpeakerBar = styled(StyledSkeletonBar)`
  width: 96px;
`;

const StyledSkeletonTextBar = styled(StyledSkeletonBar)<{ $width: string }>`
  width: ${({ $width }) => $width};
`;

const StyledSkeletonEntry = styled.div`
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  gap: ${recordingThemeCssVariables.spacing[2]};
  padding: ${recordingThemeCssVariables.spacing[2]};
  width: 100%;
`;

const StyledSkeletonEntryHeader = styled.div`
  align-items: center;
  display: flex;
  gap: ${recordingThemeCssVariables.spacing[2]};
  min-height: ${recordingThemeCssVariables.spacing[6]};
`;

const StyledSkeletonContainer = styled.div`
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  gap: ${recordingThemeCssVariables.spacing[2]};
  min-height: 240px;
  width: 100%;
`;

export const RecordingSkeletonLoader = () => {
  const skeletonEntries = Array.from(
    { length: SKELETON_ENTRY_COUNT },
    (_, skeletonEntryIndex) => skeletonEntryIndex,
  );

  return (
    <StyledSkeletonContainer aria-hidden="true">
      {skeletonEntries.map((skeletonEntryIndex) => (
        <StyledSkeletonEntry key={skeletonEntryIndex}>
          <StyledSkeletonEntryHeader>
            <StyledSkeletonAvatar />
            <StyledSkeletonSpeakerBar />
          </StyledSkeletonEntryHeader>
          <StyledSkeletonTextBar $width="100%" />
          <StyledSkeletonTextBar
            $width={skeletonEntryIndex % 2 === 0 ? '75%' : '55%'}
          />
        </StyledSkeletonEntry>
      ))}
    </StyledSkeletonContainer>
  );
};
