import * as React from 'react';
import { emailTheme } from 'src/common-style';
import { Link as EmailLink } from '@react-email/components';

const linkStyle = {
    color: emailTheme.font.colors.primary,
};

export const Link = ({ value, href }) => {
  return (
    <EmailLink href={href} style={linkStyle}>
      {value}
    </EmailLink>
  );
};
