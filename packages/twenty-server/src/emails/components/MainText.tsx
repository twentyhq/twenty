import { Text } from '@react-email/text';
import * as React from 'react';

const mainTextStyle = {
  fontSize: '13px',
  fontWeight: 400,
  color: '#666',
};

export const MainText = ({ children }) => {
  return <Text style={mainTextStyle}>{children}</Text>;
};
