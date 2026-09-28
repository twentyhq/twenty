import { LightIconButton } from 'twenty-ui/components';
import { type IconComponent } from 'twenty-ui/icon';

type WidgetCardHeaderActionButtonProps = {
  Icon: IconComponent;
  label: string;
  onClick: () => void;
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
