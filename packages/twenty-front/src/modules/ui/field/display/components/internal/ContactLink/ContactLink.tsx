import { css } from '@linaria/core';
import * as React from 'react';

import { getSafeUrl } from 'twenty-ui/utilities';

const styles = {
  root: css`
    & {
      color: inherit;
      overflow: hidden;
      text-decoration: underline;
      text-decoration-color: var(--t-border-color-strong);
      text-overflow: ellipsis;
      white-space: nowrap;
      width: 100%;
      max-width: var(--contact-link-max-width);
    }
    &:hover {
      text-decoration-color: var(--t-font-color-primary);
    }
  `,
};

type ContactLinkProps = {
  href: string;
  children?: React.ReactNode;
  onClick?: (event: React.MouseEvent<HTMLElement>) => void;
  maxWidth?: number;
};

export const ContactLink = ({
  href,
  children,
  onClick,
  maxWidth,
}: ContactLinkProps) => {
  return (
    <a
      className={styles.root}
      style={
        {
          '--contact-link-max-width': maxWidth ?? '100%',
        } as React.CSSProperties
      }
      target="_blank"
      onClick={onClick}
      href={getSafeUrl(href)}
    >
      {children}
    </a>
  );
};
