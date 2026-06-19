import styled from '@emotion/styled';

import { recordingThemeCssVariables } from 'src/front-components/constants/recording-theme-css-variables';

type SerializedMediaEventData = {
  currentTime?: number;
};

const StyledVideoWrapper = styled.div`
  background: #000000;
  border: 1px solid ${recordingThemeCssVariables.border.colorLight};
  border-radius: ${recordingThemeCssVariables.border.radiusMd};
  flex-shrink: 0;
  overflow: hidden;
`;

const StyledVideo = styled.video`
  display: block;
  max-height: 360px;
  width: 100%;
`;

type RecordingVideoPlayerProps = {
  src: string;
  extension: string;
  onTimeUpdate: (currentTimeSeconds: number) => void;
};

export const RecordingVideoPlayer = ({
  src,
  extension,
  onTimeUpdate,
}: RecordingVideoPlayerProps) => (
  <StyledVideoWrapper>
    <StyledVideo
      controls
      onTimeUpdate={(event: unknown) => {
        const serializedCurrentTime = (
          event as CustomEvent<SerializedMediaEventData>
        ).detail?.currentTime;
        const nativeCurrentTime = (
          event as { currentTarget?: { currentTime?: unknown } }
        ).currentTarget?.currentTime;
        const currentTimeSeconds =
          typeof serializedCurrentTime === 'number'
            ? serializedCurrentTime
            : nativeCurrentTime;

        if (typeof currentTimeSeconds === 'number') {
          onTimeUpdate(currentTimeSeconds);
        }
      }}
    >
      <source src={src} type={`video/${extension}`} />
    </StyledVideo>
  </StyledVideoWrapper>
);
