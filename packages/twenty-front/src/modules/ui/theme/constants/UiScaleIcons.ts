import {
  type IconComponent,
  IconSettings,
  IconZoomIn,
  IconZoomOut,
  IconZoomReset,
} from 'twenty-ui/icon';

import { type UiScale } from '@/ui/theme/types/UiScale';

export const UI_SCALE_ICONS: Record<UiScale, IconComponent> = {
  Default: IconSettings,
  Smaller: IconZoomOut,
  Normal: IconZoomReset,
  Large: IconZoomIn,
  Larger: IconZoomIn,
};
