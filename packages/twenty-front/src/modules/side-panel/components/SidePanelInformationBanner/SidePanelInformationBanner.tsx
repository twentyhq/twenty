import { css } from '@linaria/core';
import { clsx } from 'clsx';
import { isDefined } from 'twenty-ui/utilities';

import { IconAlertTriangle, IconInfoCircle } from 'twenty-ui/icon';
import { Tooltip } from 'twenty-ui/primitives/surfaces';

const styles = {
  banner: css`
    & {
      align-items: center;
      background-color: var(--t-accent-secondary);
      border-radius: var(--t-border-radius-md);
      box-sizing: border-box;
      display: flex;
      gap: var(--t-spacing-2);
      padding: var(--t-spacing-2);
      width: 100%;
    }
  `,
  iconContainer: css`
    & {
      align-items: center;
      color: var(--t-color-blue);
      display: flex;
      flex-shrink: 0;
      height: 16px;
      justify-content: center;
      width: 16px;
    }
  `,
  message: css`
    & {
      color: var(--t-color-blue);
      flex-grow: 1;
      font-family: var(--t-font-family);
      font-size: var(--t-font-size-sm);
      font-style: normal;
      font-weight: var(--t-font-weight-medium);
      line-height: 1.4;
      margin: 0;
      min-width: 0;
    }
  `,
};

import { type SidePanelInformationBannerProps } from './types/SidePanelInformationBannerProps';

export const SidePanelInformationBanner = ({
  message,
  className,
  variant = 'default',
  tooltipMessage,
}: SidePanelInformationBannerProps) => {
  return (
    <Tooltip
      content={tooltipMessage}
      disabled={!isDefined(tooltipMessage)}
      side="bottom"
      delay={500}
    >
      <div className={clsx(styles.banner, className)}>
        <div className={styles.iconContainer}>
          {variant === 'default' ? (
            <IconInfoCircle size={16} />
          ) : (
            <IconAlertTriangle size={16} />
          )}
        </div>
        <p className={styles.message}>{message}</p>
      </div>
    </Tooltip>
  );
};
