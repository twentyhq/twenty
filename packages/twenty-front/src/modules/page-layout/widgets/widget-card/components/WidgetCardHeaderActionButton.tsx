import {
  LightIconButton,
  type LightIconButtonProps,
} from 'twenty-ui/components/input';
import { type IconComponent } from 'twenty-ui/icon';

type WidgetCardHeaderActionButtonProps = Omit<
  LightIconButtonProps,
  'aria-label' | 'title' | 'emphasis' | 'size' | 'children'
> & {
  Icon: IconComponent;
  label: string;
};

export const WidgetCardHeaderActionButton = ({
  Icon,
  label,
  ...buttonProps
}: WidgetCardHeaderActionButtonProps) => (
  <LightIconButton
    // oxlint-disable-next-line react/jsx-props-no-spreading
    {...buttonProps}
    aria-label={label}
    title={label}
    emphasis="subtle"
    size="sm"
  >
    <Icon />
  </LightIconButton>
);
