import { Text } from '@react-email/text';
import * as React from 'react';

import { emailTheme } from 'src/emails/common-style';

const mainTextStyle = {
  fontSize: '13px',
  fontWeight: emailTheme.font.weight.regular,
  color: emailTheme.font.colors.inverted,
};

export const MainText = ({ children }) => {
  return <Text style={mainTextStyle}>{children}</Text>;
};
