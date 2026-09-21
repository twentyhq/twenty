import { isNonEmptyString } from '@sniptt/guards';
import { isDefined } from 'twenty-shared/utils';
import { type RunApplicationHealthCheckMutation } from '~/generated-metadata/graphql';

type ApplicationHealthCheckResult = NonNullable<
  RunApplicationHealthCheckMutation['runApplicationHealthCheck']
>;

type ApplicationHealthBanner = {
  status: ApplicationHealthCheckResult['status'];
  message: string;
  action?: { label: string; tabId: string };
};

export const getApplicationHealthBanner = ({
  healthCheckResult,
  availableTabIds,
  fallbackTabId,
}: {
  healthCheckResult?: ApplicationHealthCheckResult | null;
  availableTabIds: string[];
  fallbackTabId?: string;
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

  const tabId = isNonEmptyString(action.location)
    ? action.location
    : fallbackTabId;

  if (!isDefined(tabId) || !availableTabIds.includes(tabId)) {
    return { status, message };
  }

  return { status, message, action: { label: action.label, tabId } };
};
