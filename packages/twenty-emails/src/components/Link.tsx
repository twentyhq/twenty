import * as React from 'react';
import { Link as EmailLink } from '@react-email/components';
import { emailTheme } from 'src/common-style';

const linkStyle = {
  color: emailTheme.font.colors.tertiary,
  textDecoration: 'underline',
};

export const Link = ({ value, href }) => {
  return (
    <EmailLink href={href} style={linkStyle}>
      {value}
    </EmailLink>
  );
};
