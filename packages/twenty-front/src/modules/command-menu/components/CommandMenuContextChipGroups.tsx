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
  const firstChips = contextChips.slice(0, -1);
  const lastChip = contextChips.at(-1);

  return (
    <>
      <CommandMenuContextChip
        Icons={firstChips.map((chip) => chip.Icons?.[0])}
      />

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
