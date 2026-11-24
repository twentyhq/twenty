import { SelectOptionDescriptionTooltipContext } from '@/ui/input/contexts/SelectOptionDescriptionTooltipContext';
import { TooltipDelay } from '@/ui/layout/tooltip/constants/TooltipDelay';
import { isNonEmptyString } from '@sniptt/guards';
import { type ReactElement, useContext } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { Tooltip } from 'twenty-ui/primitives/surfaces';

type SelectOptionDescriptionTooltipProps = {
  description?: string | null;
  children: ReactElement;
};

export const SelectOptionDescriptionTooltip = ({
  description,
  children,
}: SelectOptionDescriptionTooltipProps) => {
  const tooltipHandle = useContext(SelectOptionDescriptionTooltipContext);

  if (!isDefined(tooltipHandle) || !isNonEmptyString(description)) {
    return children;
  }

  return (
    <Tooltip.Trigger
      handle={tooltipHandle}
      payload={description}
      delay={TooltipDelay.mediumDelay}
      render={children}
    />
  );
};
