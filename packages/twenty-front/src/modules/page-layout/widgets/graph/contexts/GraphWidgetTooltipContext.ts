import { type VirtualElement } from '@floating-ui/react';
import { type ReactNode } from 'react';
import { createRequiredContext } from '~/utils/createRequiredContext';

export type GraphWidgetTooltipContextType = {
  show: (
    anchorElement: Element | VirtualElement,
    content: ReactNode,
    interactive?: boolean,
  ) => void;
  scheduleHide: () => void;
  cancelHide: () => void;
  hide: () => void;
  isVisible: boolean;
};

export const [GraphWidgetTooltipProvider, useGraphWidgetTooltip] =
  createRequiredContext<GraphWidgetTooltipContextType>('GraphWidgetTooltip');
