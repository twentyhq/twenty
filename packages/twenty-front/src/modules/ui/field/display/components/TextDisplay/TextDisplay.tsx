import { css } from '@linaria/core';
import { clsx } from 'clsx';
import { useMemo } from 'react';
import { isDefined } from 'twenty-shared/utils';

import { OverflowingTextWithTooltip } from 'twenty-ui/primitives/typography';
import { LinkifiedText } from '@/ui/field/display/components/LinkifiedText/LinkifiedText';
import { useFieldDisplayTooltipProps } from '@/ui/field/display/hooks/useFieldDisplayTooltipProps';

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
  const tooltipProps = useFieldDisplayTooltipProps();
  const linkifiedText = useMemo(() => <LinkifiedText text={text} />, [text]);
  const fixHeight = !isDefined(displayedMaxRows) || displayedMaxRows === 1;

  return (
    <div className={clsx(styles.container, fixHeight && styles.fixHeight)}>
      <OverflowingTextWithTooltip
        text={linkifiedText}
        tooltipContent={text}
        lineClamp={displayedMaxRows}
        isTooltipMultiline={true}
        // oxlint-disable-next-line react/jsx-props-no-spreading
        {...tooltipProps}
      />
    </div>
  );
};
