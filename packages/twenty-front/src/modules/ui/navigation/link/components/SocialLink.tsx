import * as React from 'react';

import { getDisplayValueByUrlType } from '~/utils/getDisplayValueByUrlType';

import { RoundedLink } from './RoundedLink';

export enum LinkType {
  Url = 'url',
  LinkedIn = 'linkedin',
  Twitter = 'twitter',
}

type SocialLinkProps = {
  href: string;
  children?: React.ReactNode;
  type: LinkType;
  onClick?: (event: React.MouseEvent<HTMLElement>) => void;
};

export const SocialLink = ({
  children,
  href,
  onClick,
  type,
}: SocialLinkProps) => {
  const displayValue =
    getDisplayValueByUrlType({ type: type, href: href }) ?? children;

  return (
    <RoundedLink href={href} onClick={onClick}>
      {displayValue}
    </RoundedLink>
  );
};
