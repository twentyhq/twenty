import { t } from '@lingui/core/macro';
import { isDefined } from 'twenty-shared/utils';

export const getRecordShowPageBreadcrumbPaginationLabel = ({
  rank,
  total,
  isGroupByActive,
  viewName,
  isGroupValueLoading,
  groupValueLabel,
}: {
  rank: string;
  total: string;
  isGroupByActive: boolean;
  viewName?: string;
  isGroupValueLoading: boolean;
  groupValueLabel?: string;
}): string => {
  if (!isGroupByActive || !isDefined(viewName)) {
    return `(${rank}/${total})`;
  }

  if (isGroupValueLoading || !isDefined(groupValueLabel)) {
    return t`(${rank}/${total} in ${viewName})`;
  }

  return t`(${rank}/${total} in ${viewName} → ${groupValueLabel})`;
};
