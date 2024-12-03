import { Tag, ThemeColor } from 'twenty-ui';

type SelectFieldDisplayContentProps = {
  color: ThemeColor;
  label: string;
};

export const SelectFieldDisplayContent = ({
  color,
  label,
}: SelectFieldDisplayContentProps) => {
  return <Tag preventShrink color={color} text={label} />;
};
