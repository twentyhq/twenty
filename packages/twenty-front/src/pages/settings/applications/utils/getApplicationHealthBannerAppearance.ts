import { type CalloutStatus } from 'twenty-ui/components/feedback';
import {
  IconAlertCircle,
  IconAlertTriangle,
  IconCheck,
  IconHelp,
  IconInfoCircle,
  type IconComponent,
} from 'twenty-ui/icon';
import { ApplicationHealthStatus } from '~/generated-metadata/graphql';

type ApplicationHealthBannerAppearance = {
  status: CalloutStatus;
  Icon: IconComponent;
};

const APPEARANCE_BY_STATUS: Partial<
  Record<ApplicationHealthStatus, ApplicationHealthBannerAppearance>
> = {
  [ApplicationHealthStatus.SUCCESS]: {
    status: 'success',
    Icon: IconCheck,
  },
  [ApplicationHealthStatus.INFO]: {
    status: 'info',
    Icon: IconInfoCircle,
  },
  [ApplicationHealthStatus.WARNING]: {
    status: 'warning',
    Icon: IconAlertTriangle,
  },
  [ApplicationHealthStatus.ERROR]: {
    status: 'error',
    Icon: IconAlertCircle,
  },
  [ApplicationHealthStatus.NEUTRAL]: {
    status: 'neutral',
    Icon: IconHelp,
  },
};

export const getApplicationHealthBannerAppearance = (
  healthStatus: ApplicationHealthStatus,
): ApplicationHealthBannerAppearance | undefined =>
  APPEARANCE_BY_STATUS[healthStatus];
