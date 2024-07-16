import { PropsWithChildren as MainTextProps } from 'react';
import { Text } from '@react-email/text';

import { emailTheme } from 'src/common-style';

const mainTextStyle = {
  fontFamily: emailTheme.font.family,
  fontSize: emailTheme.font.size.md,
  fontWeight: emailTheme.font.weight.regular,
  color: emailTheme.font.colors.primary,
  margin: '0 0 12px 0',
  lineHeight: emailTheme.font.lineHeight,
};

export const MainText = ({ children }: MainTextProps) => {
  return <Text style={mainTextStyle}>{children}</Text>;
};
