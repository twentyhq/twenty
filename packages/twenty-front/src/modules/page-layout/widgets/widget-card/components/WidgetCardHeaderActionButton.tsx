import { type IconComponent } from 'twenty-ui/icon';
import { LightIconButton } from 'twenty-ui/input';

type WidgetCardHeaderActionButtonProps = {
  Icon: IconComponent;
  label: string;
  // Optional so the button can act as a dropdown trigger, where the dropdown
  // owns the click handling.
  onClick?: () => void;
  disabled?: boolean;
};

export const WidgetCardHeaderActionButton = ({
  Icon,
  label,
  onClick,
  disabled,
}: WidgetCardHeaderActionButtonProps) => (
  <LightIconButton
    Icon={Icon}
    aria-label={label}
    title={label}
    accent="tertiary"
    size="small"
    onClick={onClick}
    disabled={disabled}
  />
);
