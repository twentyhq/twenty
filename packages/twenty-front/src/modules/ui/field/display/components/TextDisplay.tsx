import { useInlineCell } from '@/object-record/record-inline-cell/hooks/useInlineCell';
import { OverflowingTextWithTooltip } from 'twenty-ui';

type TextDisplayProps = {
  text: string;
  displayedMaxRows?: number;
};

export const TextDisplay = ({ text, displayedMaxRows }: TextDisplayProps) => {
  const { isInlineCellInEditMode } = useInlineCell();
  return (
    <OverflowingTextWithTooltip
      text={text}
      displayedMaxRows={displayedMaxRows}
      isTooltipMultiline={true}
      hideTooltip={isInlineCellInEditMode}
    />
  );
};
