import { isUpgradeSequenceCursorAtOrAfterCommand } from 'src/engine/core-modules/target/utils/is-upgrade-sequence-cursor-at-or-after-command.util';

const sequence = [{ name: 'before' }, { name: 'target' }, { name: 'after' }];

describe('isUpgradeSequenceCursorAtOrAfterCommand', () => {
  it.each(['target', 'after'])(
    'returns true for the %s cursor',
    (cursorName) => {
      expect(
        isUpgradeSequenceCursorAtOrAfterCommand({
          commandName: 'target',
          cursorName,
          sequence,
        }),
      ).toBe(true);
    },
  );

  it.each(['before', 'missing'])(
    'returns false for the %s cursor',
    (cursorName) => {
      expect(
        isUpgradeSequenceCursorAtOrAfterCommand({
          commandName: 'target',
          cursorName,
          sequence,
        }),
      ).toBe(false);
    },
  );

  it('returns false when the command is not in the sequence', () => {
    expect(
      isUpgradeSequenceCursorAtOrAfterCommand({
        commandName: 'missing',
        cursorName: 'after',
        sequence,
      }),
    ).toBe(false);
  });
});
