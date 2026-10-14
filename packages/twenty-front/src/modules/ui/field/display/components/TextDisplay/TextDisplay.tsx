import { css } from '@linaria/core';
import { clsx } from 'clsx';
import { useMemo } from 'react';
import { isDefined } from 'twenty-shared/utils';

import {
  OverflowingTextWithTooltip,
  Text,
} from 'twenty-ui/primitives/typography';
import { LinkifiedText } from '@/ui/field/display/components/LinkifiedText/LinkifiedText';
import { type FieldDisplayTooltipProps } from '@/ui/field/display/types/FieldDisplayTooltipProps';

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
  text: css`
    & {
      max-width: 100%;
    }
  `,
  multilineText: css`
    & {
      overflow-wrap: break-word;
      white-space: pre-wrap;
    }
  `,
};

type TextDisplayProps = FieldDisplayTooltipProps & {
  text: string;
  displayedMaxRows?: number;
};

export const TextDisplay = ({
  text,
  displayedMaxRows,
  withTooltip = true,
  measureOverflowOnOpen,
}: TextDisplayProps) => {
  const linkifiedText = useMemo(() => <LinkifiedText text={text} />, [text]);
  const isMultiline = isDefined(displayedMaxRows);
  const fixHeight = !isMultiline || displayedMaxRows === 1;

  return (
    <div className={clsx(styles.container, fixHeight && styles.fixHeight)}>
      {withTooltip ? (
        <OverflowingTextWithTooltip
          text={linkifiedText}
          tooltipContent={text}
          lineClamp={displayedMaxRows}
          isTooltipMultiline={true}
          measureOverflowOnOpen={measureOverflowOnOpen}
        />
      ) : (
        <Text
          dir="auto"
          // oxlint-disable-next-line react/jsx-props-no-spreading
          {...(isMultiline
            ? { lineClamp: displayedMaxRows }
            : { truncate: true })}
          className={clsx(styles.text, isMultiline && styles.multilineText)}
        >
          {linkifiedText}
        </Text>
      )}
    </div>
  );
};
