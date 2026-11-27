import { isNonEmptyString } from '@sniptt/guards';
import { useState } from 'react';
import { isDefined } from 'twenty-shared/utils';

// Every refetch re-signs file URLs; following them would reload media already on screen
export const useStableMediaUrl = (url: string | undefined) => {
  const [mediaUrl, setMediaUrl] = useState(url);
  const [failedUrl, setFailedUrl] = useState<string | undefined>();

  const isMediaUrlUnusable =
    !isNonEmptyString(mediaUrl) || mediaUrl === failedUrl;

  if (isMediaUrlUnusable && mediaUrl !== url) {
    setMediaUrl(url);
  }

  return {
    mediaUrl,
    hasMediaFailedToLoad: isDefined(failedUrl) && failedUrl === mediaUrl,
    handleMediaError: () => setFailedUrl(mediaUrl),
  };
};
