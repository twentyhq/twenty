import { UnavailableFilePreview } from '@/activities/files/components/UnavailableFilePreview';
import { styled } from '@linaria/react';
import { Trans } from '@lingui/react/macro';
import { useState } from 'react';

const StyledVideo = styled.video`
  height: 100%;
  object-fit: contain;
  width: 100%;
`;

type VideoPreviewProps = {
  videoName: string;
  videoUrl: string;
};

export const VideoPreview = ({ videoName, videoUrl }: VideoPreviewProps) => {
  const [hasFailedToLoad, setHasFailedToLoad] = useState(false);

  if (hasFailedToLoad) {
    return (
      <UnavailableFilePreview
        fileName={videoName}
        fileUrl={videoUrl}
        message={
          <Trans>
            This video could not be loaded. Please download the file to view it.
          </Trans>
        }
      />
    );
  }

  return (
    <StyledVideo
      controls
      src={videoUrl}
      onError={() => setHasFailedToLoad(true)}
    />
  );
};
