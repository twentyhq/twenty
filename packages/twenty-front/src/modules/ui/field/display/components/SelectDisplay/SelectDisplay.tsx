import { type IconComponent } from 'twenty-ui/icon';
import { Tag } from 'twenty-ui/primitives/data-display';
import { type ThemeColor } from 'twenty-ui/theme';
import { isDefined } from 'twenty-shared/utils';

type SelectDisplayProps = {
  color: ThemeColor | 'transparent';
  label: string;
  Icon?: IconComponent;
};

export const SelectDisplay = ({ color, label, Icon }: SelectDisplayProps) => (
  <Tag
    truncate={false}
    style={{ minWidth: 'fit-content' }}
    color={color}
    startIcon={isDefined(Icon) ? <Icon /> : undefined}
  >
    {label}
  </Tag>
);
