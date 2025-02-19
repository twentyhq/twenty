import { isDefined } from 'twenty-shared';
import {
  CommandMenuContextChip,
  CommandMenuContextChipProps,
} from './CommandMenuContextChip';

export const CommandMenuContextChipGroups = ({
  contextChips,
}: {
  contextChips: CommandMenuContextChipProps[];
}) => {
  if (contextChips.length === 0) {
    return null;
  }

  if (contextChips.length < 3) {
    return (
      <>
        {contextChips.map((chip) => (
          <CommandMenuContextChip
            key={chip.text}
            Icons={chip.Icons}
            text={chip.text}
            onClick={chip.onClick}
          />
        ))}
      </>
    );
  }

  const firstChips = contextChips.slice(0, -1);
  const lastChip = contextChips.at(-1);

  return (
    <>
      {firstChips.length > 0 && (
        <CommandMenuContextChip
          Icons={firstChips.map((chip) => chip.Icons?.[0])}
        />
      )}

      {isDefined(lastChip) && (
        <CommandMenuContextChip
          Icons={lastChip.Icons}
          text={lastChip.text}
          onClick={lastChip.onClick}
        />
      )}
    </>
  );
};
