import { Text } from '@react-email/components';

import { emailTheme } from 'src/common-style';

type ShadowTextProps = {
  children: JSX.Element | JSX.Element[] | string;
};

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
