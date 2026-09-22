import { type MediaSessionMediaType } from 'twenty-front-component-renderer';
import { type ApplicationCapability } from 'twenty-shared/application';

export const getMissingFrontComponentMediaCapabilities = ({
  grantedCapabilities,
  mediaTypes,
}: {
  grantedCapabilities: string[];
  mediaTypes: MediaSessionMediaType[];
}): ApplicationCapability[] => {
  const requestedCapabilities: ApplicationCapability[] = [];

  if (mediaTypes.includes('audio')) {
    requestedCapabilities.push('microphone');
  }

  if (mediaTypes.includes('video')) {
    requestedCapabilities.push('camera');
  }

  return requestedCapabilities.filter(
    (capability) => !grantedCapabilities.includes(capability),
  );
};
