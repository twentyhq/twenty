import { isNonEmptyString } from '@sniptt/guards';
import { isDefined, isSafeInternalPath } from 'twenty-shared/utils';
import {
  ApplicationHealthStatus,
  type ApplicationHealthCheckResultFieldsFragment,
} from '~/generated-metadata/graphql';

export type ConnectionCheckBannerAction =
  | { kind: 'internal'; label: string; to: string }
  | { kind: 'external'; label: string; url: string };

export type ConnectionCheckBanner = {
  status: ApplicationHealthStatus;
  title: string;
  description?: string;
  action?: ConnectionCheckBannerAction;
};

const isHttpsUrl = (location: string): boolean => {
  try {
    return new URL(location).protocol === 'https:';
  } catch {
    return false;
  }
};

// The server already limits external actions to the provider's own hosts;
// this only refuses anything that is neither an internal path nor https.
const toBannerAction = ({
  label,
  location,
}: {
  label: string;
  location: string | null | undefined;
}): ConnectionCheckBannerAction | undefined => {
  if (!isNonEmptyString(location)) {
    return undefined;
  }

  if (isSafeInternalPath(location)) {
    return { kind: 'internal', label, to: location };
  }

  return isHttpsUrl(location)
    ? { kind: 'external', label, url: location }
    : undefined;
};

export const getConnectionCheckBanner = (
  connectionCheckResult: ApplicationHealthCheckResultFieldsFragment | null,
): ConnectionCheckBanner | undefined => {
  if (
    !isDefined(connectionCheckResult) ||
    connectionCheckResult.status === ApplicationHealthStatus.OK ||
    connectionCheckResult.status === ApplicationHealthStatus.UNKNOWN ||
    !isNonEmptyString(connectionCheckResult.title)
  ) {
    return undefined;
  }

  const { status, title, description, action } = connectionCheckResult;
  const bannerAction = isDefined(action)
    ? toBannerAction({ label: action.label, location: action.location })
    : undefined;

  return {
    status,
    title,
    ...(isNonEmptyString(description) ? { description } : {}),
    ...(isDefined(bannerAction) ? { action: bannerAction } : {}),
  };
};
