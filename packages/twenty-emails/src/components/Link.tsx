import { ReactNode } from 'react';
import { Link as EmailLink } from '@react-email/components';

import { emailTheme } from 'src/common-style';

const linkStyle = {
  color: emailTheme.font.colors.tertiary,
  textDecoration: 'underline',
};

type LinkProps = {
  value: ReactNode;
  href: string;
};

export const Link = ({ value, href }: LinkProps) => {
  return (
    <EmailLink href={href} style={linkStyle}>
      {value}
    </EmailLink>
  );
};
