import { useLingui } from '@lingui/react/macro';

import { SALESFARCE_BADGE_CLASS_NAME } from '@/salesfarce/constants/SalesfarceBadgeClassName';
import '@/salesfarce/styles/salesfarce-badge.css';

export const SalesfarceBadge = () => {
  const { t } = useLingui();

  return (
    <span className={SALESFARCE_BADGE_CLASS_NAME}>{t`Enterprise only`}</span>
  );
};
