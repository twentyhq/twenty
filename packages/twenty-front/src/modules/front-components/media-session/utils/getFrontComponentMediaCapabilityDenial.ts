import {
  type MediaSessionMediaType,
  type MediaSessionStartVeto,
} from 'twenty-front-component-renderer';

export const getFrontComponentMediaCapabilityDenial = ({
  grantedCapabilities,
  mediaTypes,
}: {
  grantedCapabilities: string[];
  mediaTypes: MediaSessionMediaType[];
}): MediaSessionStartVeto | null => {
  if (
    mediaTypes.includes('audio') &&
    !grantedCapabilities.includes('microphone')
  ) {
    return {
      errorName: 'NotAllowedError',
      errorMessage: 'This application does not have microphone access',
    };
  }

  if (mediaTypes.includes('video') && !grantedCapabilities.includes('camera')) {
    return {
      errorName: 'NotAllowedError',
      errorMessage: 'This application does not have camera access',
    };
  }

  return null;
};
