import { isNonEmptyString } from '@sniptt/guards';
import { styled } from '@linaria/react';
import { type MouseEvent } from 'react';

import { getSafeUrl } from 'twenty-ui/utilities';

const StyledLink = styled.a`
  align-items: center;
  background-color: var(--t-background-transparent-lighter);
  border: 1px solid var(--t-border-color-strong);
  border-radius: var(--t-border-radius-pill);
  box-sizing: content-box;
  color: var(--t-font-color-primary);
  corner-shape: round;
  cursor: pointer;
  display: inline-flex;
  font-weight: var(--t-font-size-md);
  gap: var(--t-spacing-1);
  height: 10px;
  justify-content: center;
  flex-shrink: 0;
  // Never wider than its container (content box + inline padding + border),
  // so a long label is ellipsized inside the chip instead of the chip being
  // clipped by the container, which in RTL cuts the start of an LTR value.
  max-width: calc(100% - 2 * var(--t-spacing-2) - 2px);
  overflow: hidden;
  padding: var(--t-spacing-1) var(--t-spacing-2);
  text-decoration: none;
  text-overflow: ellipsis;
  user-select: none;
  white-space: nowrap;

  &[data-color='secondary'] {
    color: var(--t-font-color-secondary);
  }

  &:hover {
    background-color: var(--t-background-transparent-light);
  }

  &:active {
    background-color: var(--t-background-transparent-medium);
  }
`;

const StyledLabel = styled.span`
  overflow: hidden;
  text-overflow: ellipsis;
`;

type RoundedLinkProps = {
  href: string;
  label?: string;
  color?: 'primary' | 'secondary';
  dir?: 'ltr' | 'rtl' | 'auto';
  onClick?: (event: React.MouseEvent<HTMLElement>) => void;
  className?: string;
};

export const RoundedLink = ({
  label,
  href,
  color = 'primary',
  // Emails, URLs and names can read in either direction whatever the page
  // direction; by default each one is laid out and truncated by its own.
  dir = 'auto',
  onClick,
  className,
}: RoundedLinkProps) => {
  if (!isNonEmptyString(label)) {
    return <></>;
  }

  const handleClick = (event: MouseEvent<HTMLElement>) => {
    event.stopPropagation();
    onClick?.(event);
  };

  return (
    <StyledLink
      href={getSafeUrl(href)}
      target="_blank"
      rel="noreferrer"
      dir={dir}
      onClick={handleClick}
      data-color={color}
      className={className}
    >
      <StyledLabel>{label}</StyledLabel>
    </StyledLink>
  );
};
