import { IconComponent, Tag, ThemeColor } from 'twenty-ui';

type SelectDisplayProps = {
  color: ThemeColor | 'transparent';
  label: string;
  Icon?: IconComponent;
  removeHorizontalPadding?: boolean;
};

export const SelectDisplay = ({
  color,
  label,
  Icon,
  removeHorizontalPadding,
}: SelectDisplayProps) => {
  return (
    <Tag
      preventShrink
      color={color}
      text={label}
      Icon={Icon}
      preventPadding={removeHorizontalPadding}
    />
  );
};
