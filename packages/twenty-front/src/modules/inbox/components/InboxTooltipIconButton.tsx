import { type IconComponent } from 'twenty-ui/icon';
import { LightIconButton } from 'twenty-ui/components';
import { Tooltip } from 'twenty-ui/primitives/surfaces';

import { TooltipDelay } from '@/ui/layout/tooltip/constants/TooltipDelay';

type InboxTooltipIconButtonProps = {
  Icon: IconComponent;
  label: string;
  emphasis?: 'standard' | 'subtle';
  onClick?: () => void;
};

export const InboxTooltipIconButton = ({
  Icon,
  label,
  emphasis = 'standard',
  onClick,
}: InboxTooltipIconButtonProps) => (
  <Tooltip
    content={label}
    delay={TooltipDelay.shortDelay}
    side="top"
    sideOffset={5}
  >
    <span>
      <LightIconButton emphasis={emphasis} aria-label={label} onClick={onClick}>
        <Icon />
      </LightIconButton>
    </span>
  </Tooltip>
);
