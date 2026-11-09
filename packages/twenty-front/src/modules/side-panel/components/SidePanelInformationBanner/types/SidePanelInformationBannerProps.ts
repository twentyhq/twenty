import { type ReactNode } from 'react';

export type SidePanelInformationBannerProps = {
  message: string;
  className?: string;
  variant?: 'default' | 'warning';
  tooltipMessage?: string;
  action?: ReactNode;
};
