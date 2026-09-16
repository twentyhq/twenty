import { useId } from 'react';
import { type IconComponent } from 'twenty-ui/icon';
import { LightIconButton } from 'twenty-ui/primitives/input';
import {
  AppTooltip,
  TooltipDelay,
  TooltipPosition,
} from 'twenty-ui/primitives/surfaces';

type InboxTooltipIconButtonProps = {
  Icon: IconComponent;
  label: string;
  accent?: 'secondary' | 'tertiary';
  onClick?: () => void;
};

export const InboxTooltipIconButton = ({
  Icon,
  label,
  accent = 'secondary',
  onClick,
}: InboxTooltipIconButtonProps) => {
  const tooltipId = useId();

  return (
    <span data-tooltip-id={tooltipId}>
      <LightIconButton
        Icon={Icon}
        accent={accent}
        aria-label={label}
        onClick={onClick}
      />
      <AppTooltip
        anchorSelect={`[data-tooltip-id='${tooltipId}'] > button`}
        title={label}
        delay={TooltipDelay.shortDelay}
        place={TooltipPosition.Top}
        offset={5}
        noArrow
      />
    </span>
  );
};
