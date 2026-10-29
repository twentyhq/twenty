import { type MappedValue } from 'src/database/commands/upgrade-version-command/2-53/types/mapped-value.type';

export const toMappedValue = ({
  original,
  mapped,
}: {
  original: unknown;
  mapped: unknown;
}): MappedValue =>
  JSON.stringify(original) === JSON.stringify(mapped)
    ? { value: original, hasChanged: false }
    : { value: mapped, hasChanged: true };
