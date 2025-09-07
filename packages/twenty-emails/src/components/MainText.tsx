import { Text } from '@react-email/components';

import { emailTheme } from 'src/common-style';

type MainTextProps = {
  children: JSX.Element | JSX.Element[] | string;
};

export const MainText = ({ children }: MainTextProps) => {
  const mainTextStyle = {
    fontFamily: emailTheme.font.family,
    fontSize: emailTheme.font.size.md,
    fontWeight: emailTheme.font.weight.regular,
    color: emailTheme.font.colors.primary,
    lineHeight: emailTheme.font.lineHeight,
  } as const;

  return <Text style={mainTextStyle}>{children}</Text>;
};
