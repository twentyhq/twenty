import { type MessageDescriptor } from '@lingui/core';
import { type ApplicationLogSource } from 'twenty-shared/types';

import { APPLICATION_LOG_SOURCE_LABELS } from '@/settings/application-monitoring/constants/ApplicationLogSourceLabels';

const isApplicationLogSource = (
  source: string,
): source is ApplicationLogSource =>
  Object.hasOwn(APPLICATION_LOG_SOURCE_LABELS, source);

export const getApplicationLogSourceLabel = (
  source: string,
): MessageDescriptor | undefined =>
  isApplicationLogSource(source)
    ? APPLICATION_LOG_SOURCE_LABELS[source]
    : undefined;
