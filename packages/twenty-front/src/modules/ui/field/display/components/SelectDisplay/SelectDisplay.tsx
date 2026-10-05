import { type IconComponent } from 'twenty-ui/icon';
import { Tag } from 'twenty-ui/primitives/data-display';
import { type ThemeColor } from 'twenty-ui/theme';
import { isDefined } from 'twenty-ui/utilities';

type SelectDisplayProps = {
  color: ThemeColor | 'transparent';
  label: string;
  Icon?: IconComponent;
  preventPadding?: boolean;
};

export const SelectDisplay = ({
  color,
  label,
  Icon,
  preventPadding,
}: SelectDisplayProps) => (
  <Tag
    preventShrink
    color={color}
    startIcon={isDefined(Icon) ? <Icon /> : undefined}
    preventPadding={preventPadding}
  >
    {label}
  </Tag>
);
