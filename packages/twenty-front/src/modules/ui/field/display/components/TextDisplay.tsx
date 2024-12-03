import { OverflowingTextWithTooltip } from 'twenty-ui';

type TextDisplayProps = {
  text: string;
  displayedMaxRows?: number;
};

export const TextDisplay = ({ text, displayedMaxRows }: TextDisplayProps) => (
  <OverflowingTextWithTooltip
    text={text}
    displayedMaxRows={displayedMaxRows}
    isTooltipMultiline={true}
  />
);
