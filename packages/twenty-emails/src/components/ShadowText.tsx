import { PropsWithChildren as ShadowTextProps } from 'react';
import { Text } from '@react-email/text';

import { emailTheme } from 'src/common-style';

const shadowTextStyle = {
  fontSize: emailTheme.font.size.sm,
  fontWeight: emailTheme.font.weight.regular,
  color: emailTheme.font.colors.tertiary,
  margin: '0 0 12px 0',
  lineHeight: emailTheme.font.lineHeight,
};

export const ShadowText = ({ children }: ShadowTextProps) => {
  return <Text style={shadowTextStyle}>{children}</Text>;
};
