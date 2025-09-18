import { type ReactNode } from 'react';
import { type MarkType } from 'src/utils/email-renderer/email-renderer';

export const link = (mark: MarkType, text: ReactNode): ReactNode => {
  const {
    href,
    target = '_blank',
    rel = 'noopener noreferrer',
  } = mark?.attrs || {};

  return (
    <a
      href={href}
      target={target}
      rel={rel}
      style={{ textDecoration: 'underline' }}
    >
      {text}
    </a>
  );
};
