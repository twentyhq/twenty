import { css } from '@linaria/core';
import { clsx } from 'clsx';

import { Text } from 'twenty-ui/primitives/typography';
import { isDefined } from 'twenty-ui/utilities';

const styles = {
  ellipsis: css`
    & {
      align-items: center;
      display: flex;
      height: 20px;
      max-width: 100%;
      width: 100%;
    }
  `,
};

type EllipsisDisplayProps = {
  children: React.ReactNode;
  maxWidth?: number;
  className?: string;
};

export const EllipsisDisplay = ({
  children,
  maxWidth,
  className,
}: EllipsisDisplayProps) => (
  <Text
    truncate
    className={clsx(styles.ellipsis, className)}
    style={isDefined(maxWidth) ? { maxWidth: `${maxWidth}px` } : undefined}
  >
    {children}
  </Text>
);
