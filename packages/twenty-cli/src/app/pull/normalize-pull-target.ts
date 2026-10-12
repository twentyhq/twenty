import { isValidUuid } from 'twenty-shared/utils';

import { type PullTarget } from '@/app/types/pull-target.type';
import { CliError } from '@/output/cli-error';
import { parseApiUrl } from '@/target/parse-api-url';

export const normalizePullTarget = (target: PullTarget): PullTarget => {
  if (!isValidUuid(target.workspaceId)) {
    throw new CliError({
      code: 'INVALID_RESPONSE',
      message: 'The pull base requires a workspace UUID.',
    });
  }

  return {
    apiUrl: parseApiUrl({ rawUrl: target.apiUrl, sourceName: 'Pull target' }),
    workspaceId: target.workspaceId.toLowerCase(),
  };
};
