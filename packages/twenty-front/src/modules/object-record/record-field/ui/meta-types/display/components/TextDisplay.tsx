import { isDefined } from 'twenty-shared/utils';
import { OverflowingTextWithTooltip } from 'twenty-ui/display';
import { AutoGrowingCellContainer } from 'twenty-ui/input';

type TextDisplayProps = {
  text: string;
  displayedMaxRows?: number;
};

export const TextDisplay = ({ text, displayedMaxRows }: TextDisplayProps) => {
  return (
    <AutoGrowingCellContainer
      fixHeight={!isDefined(displayedMaxRows) || displayedMaxRows === 1}
    >
      <OverflowingTextWithTooltip
        text={text}
        displayedMaxRows={displayedMaxRows}
        isTooltipMultiline={true}
      />
    </AutoGrowingCellContainer>
  );
};
