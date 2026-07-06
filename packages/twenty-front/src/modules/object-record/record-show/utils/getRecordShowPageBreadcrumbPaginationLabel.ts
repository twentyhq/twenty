import { t } from '@lingui/core/macro';
import { isNonEmptyString } from '@sniptt/guards';

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
  if (!isGroupByActive || !isNonEmptyString(viewName)) {
    return `(${rank}/${total})`;
  }

  if (isGroupValueLoading || !isNonEmptyString(groupValueLabel)) {
    return t`(${rank}/${total} in ${viewName})`;
  }

  return t`(${rank}/${total} in ${viewName} → ${groupValueLabel})`;
};
