import {
  IconAlertCircle,
  IconAlertTriangle,
  IconCheck,
  IconHelp,
  IconInfoCircle,
  type IconComponent,
} from 'twenty-ui/icon';
import { type CalloutVariant } from 'twenty-ui/primitives/feedback';
import { ApplicationHealthStatus } from '~/generated-metadata/graphql';

type ApplicationHealthBannerAppearance = {
  variant: CalloutVariant;
  Icon: IconComponent;
};

const APPEARANCE_BY_STATUS: Partial<
  Record<ApplicationHealthStatus, ApplicationHealthBannerAppearance>
> = {
  [ApplicationHealthStatus.SUCCESS]: {
    variant: 'success',
    Icon: IconCheck,
  },
  [ApplicationHealthStatus.INFO]: {
    variant: 'info',
    Icon: IconInfoCircle,
  },
  [ApplicationHealthStatus.WARNING]: {
    variant: 'warning',
    Icon: IconAlertTriangle,
  },
  [ApplicationHealthStatus.ERROR]: {
    variant: 'error',
    Icon: IconAlertCircle,
  },
  [ApplicationHealthStatus.NEUTRAL]: {
    variant: 'neutral',
    Icon: IconHelp,
  },
};

export const getApplicationHealthBannerAppearance = (
  healthStatus: ApplicationHealthStatus,
): ApplicationHealthBannerAppearance | undefined =>
  APPEARANCE_BY_STATUS[healthStatus];
