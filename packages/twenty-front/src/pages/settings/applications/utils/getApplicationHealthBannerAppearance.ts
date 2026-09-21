import {
  IconAlertCircle,
  IconInfoCircle,
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
  [ApplicationHealthStatus.INFO]: {
    color: 'blue',
    Icon: IconInfoCircle,
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
