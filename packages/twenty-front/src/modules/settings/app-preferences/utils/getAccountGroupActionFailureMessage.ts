import { type AccountGroupAction } from '@/settings/app-preferences/types/AccountGroupAction';
import { t } from '@lingui/core/macro';
import { isNonEmptyArray } from 'twenty-shared/utils';

export const getAccountGroupActionFailureMessage = ({
  action,
  targets,
  results,
}: Pick<AccountGroupAction, 'action' | 'targets'> & {
  results: PromiseSettledResult<unknown>[];
}): string | undefined => {
  const failedTargets = targets.filter(
    (_, index) => results[index].status === 'rejected',
  );

  if (!isNonEmptyArray(failedTargets)) {
    return undefined;
  }

  const failedConnectionLabels = failedTargets
    .map(({ label }) => label)
    .join(', ');
  const successfulCount = targets.length - failedTargets.length;
  const totalCount = targets.length;

  if (action === 'disconnect') {
    return t`Disconnected ${successfulCount} of ${totalCount} connections. Could not disconnect: ${failedConnectionLabels}.`;
  }

  return t`Deleted ${successfulCount} of ${totalCount} connections. Could not delete: ${failedConnectionLabels}.`;
};
