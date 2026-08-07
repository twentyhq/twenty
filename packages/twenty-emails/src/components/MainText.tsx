import { type JSX } from 'react';
import { Text } from 'react-email';

import { canvasTheme } from 'src/common-style';

type MainTextProps = {
  children: JSX.Element | JSX.Element[] | string;
};

const mainTextStyle = {
  fontFamily: canvasTheme.font.family,
  fontSize: canvasTheme.font.size.md,
  fontWeight: canvasTheme.font.weight.regular,
  color: canvasTheme.font.colors.primary,
  lineHeight: canvasTheme.font.lineHeight,
};

export const MainText = ({ children }: MainTextProps) => {
  return <Text style={mainTextStyle}>{children}</Text>;
};
