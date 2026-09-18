import { CircularProgressBar } from 'twenty-ui/primitives/feedback';
import { themeCssVariables } from 'twenty-ui/theme-constants';

const CONTROL_LOADER_SIZE_PIXELS = 16;
const CONTROL_LOADER_BAR_WIDTH_PIXELS = 2;

export const SettingsControlLoader = () => (
  <CircularProgressBar
    size={CONTROL_LOADER_SIZE_PIXELS}
    barWidth={CONTROL_LOADER_BAR_WIDTH_PIXELS}
    barColor={themeCssVariables.font.color.tertiary}
  />
);
