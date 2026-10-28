import { type ReactNode } from 'react';

import { SALESFARCE_BADGE_CLASS_NAME } from '@/salesfarce/constants/SalesfarceBadgeClassName';

type SalesfarceBadgeProps = {
  children: ReactNode;
};

export const SalesfarceBadge = ({ children }: SalesfarceBadgeProps) => (
  <span className={SALESFARCE_BADGE_CLASS_NAME}>{children}</span>
);
