import { OverflowingTextWithTooltip } from 'twenty-ui';

type TextDisplayProps = {
  text: string;
  displayedMaxRows?: number;
  allowDisplayWrap?: boolean;
};

export const TextDisplay = ({
  text,
  displayedMaxRows,
  allowDisplayWrap,
}: TextDisplayProps) => (
  <OverflowingTextWithTooltip
    text={text}
    displayedMaxRows={displayedMaxRows}
    allowDisplayWrap={allowDisplayWrap}
  />
);
