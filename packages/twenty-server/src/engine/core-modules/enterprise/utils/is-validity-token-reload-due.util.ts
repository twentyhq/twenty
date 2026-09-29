/* @license Enterprise */

import { isDefined } from 'twenty-shared/utils';

import { ENTERPRISE_VALIDITY_TOKEN_RELOAD_INTERVAL_MS } from 'src/engine/core-modules/enterprise/constants/enterprise-validity-token-reload-interval.constant';
import { ENTERPRISE_VALIDITY_TOKEN_RELOAD_RETRY_INTERVAL_MS } from 'src/engine/core-modules/enterprise/constants/enterprise-validity-token-reload-retry-interval.constant';

type IsValidityTokenReloadDueArgs = {
  lastLoadStartedAt: number | null;
  didLastLoadFail: boolean;
  now: number;
};

export const isValidityTokenReloadDue = ({
  lastLoadStartedAt,
  didLastLoadFail,
  now,
}: IsValidityTokenReloadDueArgs): boolean => {
  if (!isDefined(lastLoadStartedAt)) {
    return true;
  }

  const reloadInterval = didLastLoadFail
    ? ENTERPRISE_VALIDITY_TOKEN_RELOAD_RETRY_INTERVAL_MS
    : ENTERPRISE_VALIDITY_TOKEN_RELOAD_INTERVAL_MS;

  return now - lastLoadStartedAt >= reloadInterval;
};
