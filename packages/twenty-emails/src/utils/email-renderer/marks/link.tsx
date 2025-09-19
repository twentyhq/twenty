import { type ReactNode } from 'react';
import { type LinkMarkAttributes, type TipTapMark } from 'twenty-shared/utils';

export const link = (mark: TipTapMark, children: ReactNode): ReactNode => {
  const {
    href,
    target = '_blank',
    rel = 'noopener noreferrer',
  } = (mark.attrs as LinkMarkAttributes) || {};

  return (
    <a
      href={href}
      target={target}
      rel={rel}
      style={{ textDecoration: 'underline' }}
    >
      {children}
    </a>
  );
};
