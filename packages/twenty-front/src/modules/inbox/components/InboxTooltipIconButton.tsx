import { type IconComponent } from 'twenty-ui/icon';
import { LightIconButton } from 'twenty-ui/primitives/input';
import { Tooltip } from 'twenty-ui/primitives/surfaces';

import { TooltipDelay } from '@/ui/layout/tooltip/constants/TooltipDelay';

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
}: InboxTooltipIconButtonProps) => (
  <Tooltip
    content={label}
    delay={TooltipDelay.shortDelay}
    side="top"
    sideOffset={5}
  >
    <span>
      <LightIconButton
        Icon={Icon}
        accent={accent}
        aria-label={label}
        onClick={onClick}
      />
    </span>
  </Tooltip>
);
