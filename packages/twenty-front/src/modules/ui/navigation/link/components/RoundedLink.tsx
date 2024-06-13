import { MouseEvent } from 'react';
import { styled } from '@linaria/react';
import { isNonEmptyString } from '@sniptt/guards';
import { FONT_COMMON, THEME_COMMON } from 'twenty-ui';

type RoundedLinkProps = {
  href: string;
  label?: string;
  onClick?: (event: React.MouseEvent<HTMLElement>) => void;
};

const fontSizeMd = FONT_COMMON.size.md;
const spacing1 = THEME_COMMON.spacing(1);
const spacing3 = THEME_COMMON.spacing(3);

const spacingMultiplicator = THEME_COMMON.spacingMultiplicator;

const StyledLink = styled.a`
  align-items: center;
  background-color: var(--twentycrm-background-transparent-light);
  border: 1px solid var(--twentycrm-border-color-medium);

  border-radius: 50px;
  color: var(--twentycrm-font-color-primary);

  cursor: pointer;
  display: inline-flex;
  font-weight: ${fontSizeMd};

  gap: ${spacing1};

  height: ${spacing3};
  justify-content: center;

  max-width: calc(100% - ${spacingMultiplicator} * 2px);

  max-width: 100%;

  min-width: fit-content;

  overflow: hidden;
  padding: ${spacing1} ${spacing1};

  text-decoration: none;
  text-overflow: ellipsis;
  user-select: none;
  white-space: nowrap;
`;

export const RoundedLink = ({ label, href, onClick }: RoundedLinkProps) => {
  if (!isNonEmptyString(label)) {
    return <></>;
  }

  const handleClick = (event: MouseEvent<HTMLElement>) => {
    event.stopPropagation();

    onClick?.(event);
  };

  return (
    <StyledLink
      href={href}
      target="_blank"
      rel="noreferrer"
      onClick={handleClick}
    >
      {label}
    </StyledLink>
  );
};
