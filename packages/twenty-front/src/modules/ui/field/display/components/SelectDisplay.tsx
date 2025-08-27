import { type IconComponent } from 'twenty-ui/display';
import { Tag } from 'twenty-ui/components';
import { type ThemeColor } from 'twenty-ui/theme';

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
}: SelectDisplayProps) => {
  return (
    <Tag
      preventShrink
      color={color}
      text={label}
      Icon={Icon}
      preventPadding={preventPadding}
    />
  );
};
