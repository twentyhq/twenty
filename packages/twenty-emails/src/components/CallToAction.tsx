import * as React from 'react';
import { Button } from '@react-email/button';
import { emailTheme } from 'src/common-style';
const callToActionStyle = {
  display: 'flex',
  padding: '8px 32px',
  borderRadius: '8px',
  border: `1px solid ${emailTheme.background.transparent.light}`,
  background: emailTheme.background.radialGradient,
  boxShadow: `0px 2px 4px 0px ${emailTheme.background.transparent.light}, 0px 0px 4px 0px ${emailTheme.background.transparent.medium}`,
  color: emailTheme.font.colors.inverted,
  fontSize: emailTheme.font.size.md,
  fontWeight: emailTheme.font.weight.bold,
};

export const CallToAction = ({ value, href }) => {
  return (
    <Button href={href} style={callToActionStyle}>
      {value}
    </Button>
  );
};
