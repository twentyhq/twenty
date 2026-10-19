import { type MessageDescriptor } from '@lingui/core';
import { msg } from '@lingui/core/macro';
import { type ApplicationLogSource } from 'twenty-shared/types';

export const APPLICATION_LOG_SOURCE_LABELS: Record<
  ApplicationLogSource,
  MessageDescriptor
> = {
  LOGIC_FUNCTION: msg`Logic function`,
  INSTALL: msg`Install`,
  UPGRADE: msg`Upgrade`,
  UNINSTALL: msg`Uninstall`,
  API_RATE_LIMIT: msg`API rate limit`,
  JOB_RATE_LIMIT: msg`Job rate limit`,
  SERVER_ROUTE: msg`Server route`,
};
