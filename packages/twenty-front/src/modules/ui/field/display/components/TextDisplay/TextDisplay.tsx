import { css } from '@linaria/core';
import { clsx } from 'clsx';
import { useContext, useMemo } from 'react';
import { isDefined } from 'twenty-shared/utils';

import {
  OverflowingTextWithTooltip,
  OverflowingText,
} from 'twenty-ui/primitives/typography';
import { LinkifiedText } from '@/ui/field/display/components/LinkifiedText/LinkifiedText';
import { FieldDisplayTooltipContext } from '@/ui/field/display/contexts/FieldDisplayTooltipContext';

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
  const { withTooltip, measureOverflowOnOpen, getInitialPointerPosition } =
    useContext(FieldDisplayTooltipContext);
  const linkifiedText = useMemo(() => <LinkifiedText text={text} />, [text]);
  const fixHeight = !isDefined(displayedMaxRows) || displayedMaxRows === 1;

  return (
    <div className={clsx(styles.container, fixHeight && styles.fixHeight)}>
      {withTooltip ? (
        <OverflowingTextWithTooltip
          text={linkifiedText}
          tooltipContent={text}
          lineClamp={displayedMaxRows}
          isTooltipMultiline={true}
          measureOverflowOnOpen={measureOverflowOnOpen}
          initialPointerPosition={getInitialPointerPosition?.()}
        />
      ) : (
        <OverflowingText lineClamp={displayedMaxRows}>
          {linkifiedText}
        </OverflowingText>
      )}
    </div>
  );
};
