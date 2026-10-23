import { Link } from 'react-router-dom';
import { LightIconButton } from 'twenty-ui/components/input';
import { type IconComponent } from 'twenty-ui/icon';

type WidgetCardHeaderActionLinkProps = {
  Icon: IconComponent;
  label: string;
  to: string;
};

export const WidgetCardHeaderActionLink = ({
  Icon,
  label,
  to,
}: WidgetCardHeaderActionLinkProps) => (
  <LightIconButton
    render={<Link to={to} />}
    nativeButton={false}
    role="link"
    emphasis="subtle"
    size="sm"
    aria-label={label}
    title={label}
  >
    <Icon aria-hidden />
  </LightIconButton>
);
