import { css } from '@linaria/core';
import { isUndefined } from '@sniptt/guards';
import { clsx } from 'clsx';

import { OverflowingTextWithTooltip } from 'twenty-ui/components';

const styles = {
  container: css`
    & {
      align-items: center;
      display: flex;
      height: auto;
    }
  `,
  fixHeight: css`
    & {
      height: 20px;
    }
  `,
};

type TextDisplayProps = {
  text: string;
  displayedMaxRows?: number;
};

export const TextDisplay = ({ text, displayedMaxRows }: TextDisplayProps) => {
  const fixHeight = isUndefined(displayedMaxRows) || displayedMaxRows === 1;

  return (
    <div className={clsx(styles.container, fixHeight && styles.fixHeight)}>
      <OverflowingTextWithTooltip
        text={text}
        displayedMaxRows={displayedMaxRows}
        isTooltipMultiline={true}
      />
    </div>
  );
};
