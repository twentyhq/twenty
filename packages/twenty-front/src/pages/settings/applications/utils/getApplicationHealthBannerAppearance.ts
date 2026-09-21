import {
  IconAlertCircle,
  IconAlertTriangle,
  type IconComponent,
} from 'twenty-ui/icon';
import { type BannerColor } from 'twenty-ui/primitives/feedback';
import { ApplicationHealthStatus } from '~/generated-metadata/graphql';

type ApplicationHealthBannerAppearance = {
  color: BannerColor;
  Icon: IconComponent;
};

const APPEARANCE_BY_STATUS: Partial<
  Record<ApplicationHealthStatus, ApplicationHealthBannerAppearance>
> = {
  [ApplicationHealthStatus.WARNING]: {
    color: 'blue',
    Icon: IconAlertTriangle,
  },
  [ApplicationHealthStatus.ERROR]: {
    color: 'danger',
    Icon: IconAlertCircle,
  },
};

export const getApplicationHealthBannerAppearance = (
  healthStatus: ApplicationHealthStatus,
): ApplicationHealthBannerAppearance | undefined =>
  APPEARANCE_BY_STATUS[healthStatus];
