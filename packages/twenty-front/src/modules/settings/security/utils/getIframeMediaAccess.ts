import { type IframeMediaPermission } from 'twenty-shared/types';

import { type IframeMediaAccess } from '@/settings/security/types/IframeMediaAccess';

export const getIframeMediaAccess = ({
  microphone,
  camera,
}: Pick<IframeMediaPermission, 'microphone' | 'camera'>): IframeMediaAccess => {
  if (!camera) {
    return 'microphone';
  }

  if (!microphone) {
    return 'camera';
  }

  return 'microphoneAndCamera';
};
