import { PropsWithChildren as MainTextProps } from 'react';
import { Text } from '@react-email/text';

import { emailTheme } from 'src/common-style';

const mainTextStyle = {
  fontSize: emailTheme.font.size.md,
  fontWeight: emailTheme.font.weight.regular,
  color: emailTheme.font.colors.primary,
};

export const MainText = ({ children }: MainTextProps) => {
  return <Text style={mainTextStyle}>{children}</Text>;
};
