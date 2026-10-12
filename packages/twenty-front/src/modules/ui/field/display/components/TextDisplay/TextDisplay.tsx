import { css } from '@linaria/core';
import { isUndefined } from '@sniptt/guards';
import { clsx } from 'clsx';
import { useMemo } from 'react';

import { OverflowingTextWithTooltip } from 'twenty-ui/primitives/typography';
import { LinkifiedText } from '@/ui/field/display/components/LinkifiedText/LinkifiedText';

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
  const linkifiedText = useMemo(() => <LinkifiedText text={text} />, [text]);
  const fixHeight = isUndefined(displayedMaxRows) || displayedMaxRows === 1;

  return (
    <div className={clsx(styles.container, fixHeight && styles.fixHeight)}>
      <OverflowingTextWithTooltip
        text={linkifiedText}
        tooltipContent={text}
        lineClamp={displayedMaxRows}
        isTooltipMultiline={true}
      />
    </div>
  );
};
