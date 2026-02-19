import { useState, useEffect } from 'react';

import {
  type DevUiStatus,
  DEV_UI_STATUS_CONFIG,
  SPINNER_FRAMES,
  UPLOAD_FRAMES,
} from '@/cli/utilities/dev/ui/dev-ui-constants';

export const useAnimatedFrame = (
  frames: string[],
  interval = 80,
  enabled = true,
): string => {
  const [frameIndex, setFrameIndex] = useState(0);

  useEffect(() => {
    if (!enabled) return;

    const timer = setInterval(() => {
      setFrameIndex((currentIndex) => (currentIndex + 1) % frames.length);
    }, interval);

    return () => clearInterval(timer);
  }, [frames, interval, enabled]);

  return frames[frameIndex];
};

export const useStatusIcon = (uiStatus: DevUiStatus): string => {
  const config = DEV_UI_STATUS_CONFIG[uiStatus];
  const spinnerFrame = useAnimatedFrame(
    SPINNER_FRAMES,
    80,
    config.icon === 'spinner',
  );
  const uploadFrame = useAnimatedFrame(
    UPLOAD_FRAMES,
    200,
    config.icon === 'upload',
  );

  if (config.icon === 'spinner') return spinnerFrame;
  if (config.icon === 'upload') return uploadFrame;

  return config.icon;
};
