import { t } from '@lingui/core/macro';
import { isNonEmptyString } from '@sniptt/guards';
import { isDefined } from 'twenty-shared/utils';

import { getApplicationLogSourceLabel } from '@/settings/application-monitoring/utils/getApplicationLogSourceLabel';

export const getApplicationLogFunctionOrEventLabel = ({
  logicFunctionName,
  source,
}: {
  logicFunctionName?: string | null;
  source: string;
}): string => {
  if (isNonEmptyString(logicFunctionName)) {
    return logicFunctionName;
  }

  const sourceLabel = getApplicationLogSourceLabel(source);

  return isDefined(sourceLabel) ? t(sourceLabel) : source;
};
