import { type ReactElement, type ReactNode } from 'react';
import { Link, type LinkProps, useHref } from 'react-router-dom';

type NavigationLinkProps = Pick<LinkProps, 'to' | 'state' | 'replace'> & {
  children: (props: { href: string; render: ReactElement }) => ReactNode;
};

export const NavigationLink = ({
  to,
  state,
  replace,
  children,
}: NavigationLinkProps) => {
  const href = useHref(to);

  return children({
    href,
    render: <Link to={to} state={state} replace={replace} />,
  });
};
