import styled from '@emotion/styled';

import { SerializedEventData } from 'twenty-sdk/dist/sdk/front-component-api';

const StyledVideoWrapper = styled.div`
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid rgba(0, 0, 0, 0.06);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
  background: #000;
`;

const StyledVideo = styled.video`
  width: 100%;
  display: block;
`;

type VideoPlayerProps = {
  src: string;
  extension: string;
  onTimeUpdate?: (currentTimeSeconds: number) => void;
};

export const VideoPlayer = ({
  src,
  extension,
  onTimeUpdate,
}: VideoPlayerProps) => {
  return (
    <StyledVideoWrapper>
      <StyledVideo
        controls
        onTimeUpdate={(event: unknown) => {
          const currentTime = (event as CustomEvent<SerializedEventData>)
            .detail.currentTime;

          if (typeof currentTime === 'number') {
            onTimeUpdate?.(currentTime);
          }
        }}
      >
        <source src={src} type={`video/${extension}`} />
      </StyledVideo>
    </StyledVideoWrapper>
  );
};
