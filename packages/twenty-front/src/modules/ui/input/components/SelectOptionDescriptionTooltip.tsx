import { isNonEmptyString } from '@sniptt/guards';
import { type ComponentProps, type ReactElement } from 'react';
import { Tooltip } from 'twenty-ui/primitives/surfaces';

import { TooltipDelay } from '@/ui/layout/tooltip/constants/TooltipDelay';

type SelectOptionDescriptionTooltipProps = {
  description?: string | null;
  side?: ComponentProps<typeof Tooltip>['side'];
  children: ReactElement;
};

export const SelectOptionDescriptionTooltip = ({
  description,
  side = 'right',
  children,
}: SelectOptionDescriptionTooltipProps) => {
  if (!isNonEmptyString(description?.trim())) {
    return children;
  }

  return (
    <Tooltip
      content={description}
      side={side}
      delay={TooltipDelay.mediumDelay}
      positionMethod="fixed"
    >
      {children}
    </Tooltip>
  );
};
