import { type JSX } from 'react';
import { Text } from 'react-email';

import { canvasTheme } from 'src/common-style';

type ShadowTextProps = {
  children: JSX.Element | JSX.Element[] | string;
};

const shadowTextStyle = {
  fontSize: canvasTheme.font.size.sm,
  fontWeight: canvasTheme.font.weight.regular,
  color: canvasTheme.font.colors.tertiary,
  margin: '0 0 12px 0',
  lineHeight: canvasTheme.font.lineHeight,
};

export const ShadowText = ({ children }: ShadowTextProps) => {
  return <Text style={shadowTextStyle}>{children}</Text>;
};
