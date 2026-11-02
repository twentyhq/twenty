import { css, cx } from '@linaria/core';
import React from 'react';
import { Link } from 'react-router-dom';

const styles = {
  undecoratedLink: css`
    & {
      text-decoration: none;
    }
  `,
};

type UndecoratedLinkProps = {
  className?: string;
  to: string | number;
  children: React.ReactNode;
  replace?: boolean;
  onClick?: React.MouseEventHandler<HTMLAnchorElement>;
  fullWidth?: boolean;
};

export const UndecoratedLink = ({
  className,
  children,
  to,
  replace = false,
  onClick,
  fullWidth = false,
}: UndecoratedLinkProps) => {
  return (
    <Link
      to={to as string}
      replace={replace}
      onClick={onClick}
      className={cx(styles.undecoratedLink, className)}
      style={fullWidth ? { width: '100%' } : undefined}
    >
      {children}
    </Link>
  );
};
