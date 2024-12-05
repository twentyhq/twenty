import { Tag, ThemeColor } from 'twenty-ui';

type SelectDisplayProps = {
  color: ThemeColor;
  label: string;
};

export const SelectDisplay = ({ color, label }: SelectDisplayProps) => {
  return <Tag preventShrink color={color} text={label} />;
};
