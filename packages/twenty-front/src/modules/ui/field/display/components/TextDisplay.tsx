import { OverflowingTextWithTooltip } from 'twenty-ui/display';

type TextDisplayProps = {
  text: string;
  displayedMaxRows?: number;
};

export const TextDisplay = ({ text, displayedMaxRows }: TextDisplayProps) => {
  return (
    <OverflowingTextWithTooltip
      text={text}
      displayedMaxRows={displayedMaxRows}
      isTooltipMultiline={true}
    />
  );
};
