import { getMissingFrontComponentMediaCapabilities } from '@/front-components/media-session/utils/getMissingFrontComponentMediaCapabilities';
import {
  type MediaSessionMediaType,
  type MediaSessionStartVeto,
} from 'twenty-front-component-renderer';
import { isDefined } from 'twenty-shared/utils';

export const getFrontComponentMediaCapabilityDenial = ({
  grantedCapabilities,
  mediaTypes,
}: {
  grantedCapabilities: string[];
  mediaTypes: MediaSessionMediaType[];
}): MediaSessionStartVeto | null => {
  const [missingCapability] = getMissingFrontComponentMediaCapabilities({
    grantedCapabilities,
    mediaTypes,
  });

  if (!isDefined(missingCapability)) {
    return null;
  }

  return {
    errorName: 'NotAllowedError',
    errorMessage: `This application does not have ${missingCapability} access`,
  };
};
