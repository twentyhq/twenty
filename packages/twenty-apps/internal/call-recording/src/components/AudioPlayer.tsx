import styled from '@emotion/styled';

import { SerializedEventData } from 'twenty-sdk/dist/sdk/front-component-api';

const StyledAudioWrapper = styled.div`
  background: linear-gradient(135deg, #f8f9fb 0%, #eef0f4 100%);
  border-radius: 12px;
  padding: 20px;
  display: flex;
  align-items: center;
  border: 1px solid rgba(0, 0, 0, 0.06);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
`;

const StyledAudio = styled.audio`
  width: 100%;
  height: 36px;
  border-radius: 8px;
  outline: none;

  &::-webkit-media-controls-panel {
    background: transparent;
  }
`;

type AudioPlayerProps = {
  src: string;
  extension: string;
  onTimeUpdate?: (currentTimeSeconds: number) => void;
};

export const AudioPlayer = ({
  src,
  extension,
  onTimeUpdate,
}: AudioPlayerProps) => {
  return (
    <StyledAudioWrapper>
      <StyledAudio
        controls
        onTimeUpdate={(event: unknown) => {
          const currentTime = (event as CustomEvent<SerializedEventData>)
            .detail.currentTime;

          if (typeof currentTime === 'number') {
            onTimeUpdate?.(currentTime);
          }
        }}
      >
        <source src={src} type={`audio/${extension}`} />
      </StyledAudio>
    </StyledAudioWrapper>
  );
};
