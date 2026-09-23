import { css } from '@linaria/core';
import { Link } from 'react-router-dom';
import { type LinkChipProps } from './types/LinkChipProps';

import { LINK_CHIP_CLICK_OUTSIDE_ID } from '@/ui/navigation/link/constants/LinkChipClickOutsideId';
import { useMouseDownNavigation } from '@/ui/navigation/utils/hooks/useMouseDownNavigation';
import { Chip } from 'twenty-ui/primitives/data-display';

const styles = {
  linkContainer: css`
    & {
      display: inline-flex;
      min-width: 0;
      vertical-align: middle;
    }
    & > a {
      max-width: 100%;
      min-width: 0;
      text-decoration: none;
    }
  `,
};

export const LinkChip = ({
  to,
  target,
  onClick,
  onMouseDown,
  triggerEvent,
  ref,
  ...props
}: LinkChipProps) => {
  const { onClick: onClickHandler, onMouseDown: onMouseDownHandler } =
    useMouseDownNavigation({ to, onClick, triggerEvent });

  return (
    <span className={styles.linkContainer}>
      <Link
        to={to}
        ref={ref}
        onClick={(event) => {
          event.stopPropagation();
          onClickHandler(event);
        }}
        onMouseDown={(event) => {
          onMouseDown?.(event);
          if (!event.defaultPrevented) {
            onMouseDownHandler(event);
          }
        }}
        data-click-outside-id={LINK_CHIP_CLICK_OUTSIDE_ID}
        target={target}
        rel={target === '_blank' ? 'noopener noreferrer' : undefined}
      >
        <Chip clickable {...props} />
      </Link>
    </span>
  );
};
