import * as React from 'react';
import { Link } from 'react-router-dom';
import CompanyChip from '../chips/CompanyChip';

type OwnProps = {
  name: string;
  picture?: string;
  href: string;
};

function CellLink({ name, picture, href }: OwnProps) {
  return (
    <Link to={href}>
      <CompanyChip name={name} picture={picture} />
    </Link>
  );
}

export default CellLink;
