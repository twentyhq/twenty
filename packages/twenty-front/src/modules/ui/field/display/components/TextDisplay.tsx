import { OverflowingTextWithTooltip } from 'twenty-ui';

type TextDisplayProps = {
  text: string;
  displayedMaxRows?: number;
  wrap?: boolean;
};

export const TextDisplay = ({
  text,
  displayedMaxRows,
  wrap,
}: TextDisplayProps) => (
  <OverflowingTextWithTooltip
    text={text}
    displayedMaxRows={displayedMaxRows}
    wrap={wrap}
  />
);
