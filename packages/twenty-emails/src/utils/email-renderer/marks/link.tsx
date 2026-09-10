import { type ReactNode } from 'react';
import { type LinkMarkAttributes, type TipTapMark } from 'twenty-shared/utils';

import { safeUrl } from 'src/utils/email-renderer/utils/safe-url';

export const link = (mark: TipTapMark, children: ReactNode): ReactNode => {
  const {
    href,
    target = '_blank',
    rel = 'noopener noreferrer',
  } = (mark.attrs as LinkMarkAttributes) || {};

  return (
    <a
      href={safeUrl(href)}
      target={target}
      rel={rel}
      style={{ textDecoration: 'underline' }}
    >
      {children}
    </a>
  );
};
