import {
  type DevUiStatus,
  DEV_UI_STATUS_CONFIG,
} from '@/cli/utilities/dev/ui/dev-ui-constants';
import { useAnimationFrames } from '@/cli/utilities/dev/ui/dev-ui-animation-context';

export const useStatusIcon = (uiStatus: DevUiStatus): string => {
  const config = DEV_UI_STATUS_CONFIG[uiStatus];
  const { spinnerFrame, uploadFrame } = useAnimationFrames();

  if (config.icon === 'spinner') return spinnerFrame;
  if (config.icon === 'upload') return uploadFrame;

  return config.icon;
};
