import { isNonEmptyString } from '@sniptt/guards';
import { type MouseEvent } from 'react';

import { getSafeUrl } from 'twenty-shared/utils';
import { Chip } from 'twenty-ui/primitives/data-display';
import { OverflowingTextTooltipModeProvider } from 'twenty-ui/primitives/typography';

type RoundedLinkProps = {
  href: string;
  label?: string;
  color?: 'primary' | 'secondary';
  dir?: 'ltr' | 'rtl' | 'auto';
  onClick?: (event: MouseEvent<HTMLElement>) => void;
  className?: string;
};

export const RoundedLink = ({
  label,
  href,
  color = 'primary',
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
    <OverflowingTextTooltipModeProvider mode="disabled">
      <Chip
        variant="outline"
        shape="round"
        color={color}
        dir={dir}
        onClick={handleClick}
        render={
          <a
            href={getSafeUrl(href)}
            target="_blank"
            rel="noreferrer"
            className={className}
            style={{ flexShrink: 0, justifyContent: 'center' }}
          />
        }
      >
        <span dir={dir}>{label}</span>
      </Chip>
    </OverflowingTextTooltipModeProvider>
  );
};
