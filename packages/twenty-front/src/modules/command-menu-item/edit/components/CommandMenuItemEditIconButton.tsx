import { LightIconButton } from 'twenty-ui/components';
import { type IconComponent } from 'twenty-ui/icon';

type CommandMenuItemEditIconButtonProps = {
  ariaLabel: string;
  Icon: IconComponent;
  onClick: () => void;
};

export const CommandMenuItemEditIconButton = ({
  ariaLabel,
  Icon,
  onClick,
}: CommandMenuItemEditIconButtonProps) => (
  <LightIconButton
    aria-label={ariaLabel}
    onClick={(event) => {
      event.stopPropagation();
      onClick();
    }}
  >
    <Icon />
  </LightIconButton>
);
