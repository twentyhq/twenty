import { type ReactNode } from 'react';

export type McpSetupCard = {
  badge: string;
  ctaLabel: string;
  description: string;
  disabledTooltip?: string;
  href?: string;
  isDisabled?: boolean;
  logo: ReactNode;
  title: string;
  tooltipId?: string;
};

export type McpSetupCategory = {
  cards: McpSetupCard[];
  description: string;
  showManualConfigurationAfter?: boolean;
  title: string;
};
