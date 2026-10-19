import { type MessageDescriptor } from '@lingui/core';

import { APPLICATION_LOG_SOURCE_LABELS } from '@/settings/application-monitoring/constants/ApplicationLogSourceLabels';

export const getApplicationLogSourceLabel = (
  source: string,
): MessageDescriptor | undefined =>
  Object.entries(APPLICATION_LOG_SOURCE_LABELS).find(
    ([applicationLogSource]) => applicationLogSource === source,
  )?.[1];
