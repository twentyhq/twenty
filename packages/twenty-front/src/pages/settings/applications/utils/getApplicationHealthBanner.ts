import { isNonEmptyString } from '@sniptt/guards';
import { isDefined } from 'twenty-shared/utils';
import { isSafeInternalPath } from '@/ui/navigation/utils/isSafeInternalPath';
import { type RunApplicationHealthCheckMutation } from '~/generated-metadata/graphql';

type ApplicationHealthCheckResult = NonNullable<
  RunApplicationHealthCheckMutation['runApplicationHealthCheck']
>;

type ApplicationHealthBanner = {
  status: ApplicationHealthCheckResult['status'];
  message: string;
  action?: { label: string; to: string };
};

export const getApplicationHealthBanner = ({
  healthCheckResult,
  fallbackLocation,
}: {
  healthCheckResult?: ApplicationHealthCheckResult | null;
  fallbackLocation?: string;
}): ApplicationHealthBanner | undefined => {
  if (!isDefined(healthCheckResult)) {
    return undefined;
  }

  const { status, message, action } = healthCheckResult;

  if (!isNonEmptyString(message)) {
    return undefined;
  }

  if (!isDefined(action)) {
    return { status, message };
  }

  const to = isNonEmptyString(action.location)
    ? action.location
    : fallbackLocation;

  // An app supplies this string, so anything that could leave the workspace
  // loses its button rather than becoming a redirect to somewhere else.
  if (!isDefined(to) || !isSafeInternalPath(to)) {
    return { status, message };
  }

  return { status, message, action: { label: action.label, to } };
};
