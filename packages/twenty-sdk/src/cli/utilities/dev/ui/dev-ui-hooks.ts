import {
  type DevUiStatus,
  DEV_UI_STATUS_CONFIG,
  SPINNER_FRAMES,
  UPLOAD_FRAMES,
} from '@/cli/utilities/dev/ui/dev-ui-constants';

const TICK_INTERVAL_MS = 120;
const UPLOAD_TICK_RATIO = Math.round(200 / TICK_INTERVAL_MS);

const getAnimationFrames = () => {
  const tick = Math.floor(Date.now() / TICK_INTERVAL_MS);

  return {
    spinnerFrame: SPINNER_FRAMES[tick % SPINNER_FRAMES.length],
    uploadFrame:
      UPLOAD_FRAMES[
        Math.floor(tick / UPLOAD_TICK_RATIO) % UPLOAD_FRAMES.length
      ],
  };
};

export const useStatusIcon = (uiStatus: DevUiStatus): string => {
  const config = DEV_UI_STATUS_CONFIG[uiStatus];

  if (config.icon === 'spinner') return getAnimationFrames().spinnerFrame;
  if (config.icon === 'upload') return getAnimationFrames().uploadFrame;

  return config.icon;
};
