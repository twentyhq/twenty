import { IconComponent, Tag, ThemeColor } from 'twenty-ui';

type SelectDisplayProps = {
  color: ThemeColor | 'transparent';
  label: string;
  Icon?: IconComponent;
  isUsedInForm?: boolean;
};

export const SelectDisplay = ({
  color,
  label,
  Icon,
  isUsedInForm,
}: SelectDisplayProps) => {
  return (
    <Tag
      preventShrink
      color={color}
      text={label}
      Icon={Icon}
      preventPadding={isUsedInForm}
    />
  );
};
