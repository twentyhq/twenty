import {
  type IconComponent,
  IconSettings,
  IconZoomIn,
  IconZoomOut,
  IconZoomReset,
} from 'twenty-ui/icon';

import { type UiScaleStep } from '@/ui/theme/types/UiScaleStep';

export const UI_SCALE_ICONS: Record<UiScaleStep, IconComponent> = {
  Default: IconSettings,
  Smaller: IconZoomOut,
  Normal: IconZoomReset,
  Large: IconZoomIn,
  Larger: IconZoomIn,
};
