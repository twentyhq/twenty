import { Link as EmailLink } from '@react-email/components';

import { emailTheme } from 'src/common-style';

const linkStyle = {
  textDecoration: 'underline',
};

type LinkProps = {
  value: JSX.Element | JSX.Element[] | string;
  href: string;
  color?: string;
};

export const Link = ({ value, href, color }: LinkProps) => {
  const handleMouseDown = () => {
    window.location.href = href;
  };

  return (
    <EmailLink
      href={href}
      onMouseDown={handleMouseDown}
      style={{
        ...linkStyle,
        color: color ?? emailTheme.font.colors.tertiary,
      }}
    >
      {value}
    </EmailLink>
  );
};
