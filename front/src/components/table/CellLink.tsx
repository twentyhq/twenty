import * as React from 'react';
import { Link } from 'react-router-dom';

type OwnProps = {
  name: string;
  picture?: string;
  href: string;
  children?: React.ReactNode;
};

function CellLink({ href, children }: OwnProps) {
  return <Link to={href}>{children}</Link>;
}

export default CellLink;
