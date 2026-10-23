import { isNonEmptyString } from '@sniptt/guards';
import {
  IconApps,
  IconBrandTypescript,
  type IconComponent,
} from 'twenty-ui/icon';

export const getLogConsoleApplicationLogEventIcon = (
  event: string,
): IconComponent => (isNonEmptyString(event) ? IconBrandTypescript : IconApps);
