import { useState } from 'react';
import {
  createFrontComponentMediaSessionHost,
  type FrontComponentMediaSessionHost,
} from 'twenty-front-component-renderer';

// One capture session host per rendered front component. The host itself
// enforces the one-live-capture-at-a-time policy across the page.
export const useFrontComponentMediaSession = (): {
  mediaSessionHost: FrontComponentMediaSessionHost;
} => {
  const [mediaSessionHost] = useState(() =>
    createFrontComponentMediaSessionHost(),
  );

  return { mediaSessionHost };
};
