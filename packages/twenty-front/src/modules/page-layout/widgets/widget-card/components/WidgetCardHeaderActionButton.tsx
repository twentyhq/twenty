import { type IconComponent } from 'twenty-ui/icon';
import { LightIconButton } from 'twenty-ui/components';

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
    aria-label={label}
    title={label}
    emphasis="subtle"
    size="sm"
    onClick={onClick}
    disabled={disabled}
  >
    <Icon />
  </LightIconButton>
);
