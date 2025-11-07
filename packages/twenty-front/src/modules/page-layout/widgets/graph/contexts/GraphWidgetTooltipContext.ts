import { type ReactNode } from 'react';
import { createRequiredContext } from '~/utils/createRequiredContext';

export type GraphWidgetTooltipContextType = {
  show: (anchorElement: Element, content: ReactNode) => void;
  scheduleHide: () => void;
  cancelHide: () => void;
  hide: () => void;
};

export const [GraphWidgetTooltipProvider, useGraphWidgetTooltip] =
  createRequiredContext<GraphWidgetTooltipContextType>('GraphWidgetTooltip');
