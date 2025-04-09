import { Text } from '@react-email/components';

import { emailTheme } from 'src/common-style';

type MainTextProps = {
  children: JSX.Element | JSX.Element[] | string;
};

const mainTextStyle = {
  fontFamily: emailTheme.font.family,
  fontSize: emailTheme.font.size.md,
  fontWeight: emailTheme.font.weight.regular,
  color: emailTheme.font.colors.primary,
  lineHeight: emailTheme.font.lineHeight,
};

export const MainText = ({ children }: MainTextProps) => {
  return <Text style={mainTextStyle}>{children}</Text>;
};
