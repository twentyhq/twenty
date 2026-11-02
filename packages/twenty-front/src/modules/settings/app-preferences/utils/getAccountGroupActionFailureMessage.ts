import { type AccountGroupAction } from '@/settings/app-preferences/types/AccountGroupAction';
import { type AccountGroupActionTarget } from '@/settings/app-preferences/types/AccountGroupActionTarget';
import { t } from '@lingui/core/macro';
import { isNonEmptyArray } from 'twenty-shared/utils';

export const getAccountGroupActionFailureMessage = ({
  action,
  targets,
  results,
}: {
  action: AccountGroupAction;
  targets: AccountGroupActionTarget[];
  results: PromiseSettledResult<unknown>[];
}): string | undefined => {
  const failedTargets = targets.filter(
    (_, index) => results[index].status === 'rejected',
  );

  if (!isNonEmptyArray(failedTargets)) {
    return undefined;
  }

  const failedLabels = [
    ...new Set(failedTargets.map(({ label }) => label)),
  ].join(', ');
  const successfulCount = targets.length - failedTargets.length;
  const totalCount = targets.length;

  if (action === 'disconnect') {
    return t`Disconnected ${successfulCount} of ${totalCount} connections. Could not disconnect: ${failedLabels}.`;
  }

  return t`Deleted ${successfulCount} of ${totalCount} connections. Could not delete: ${failedLabels}.`;
};
