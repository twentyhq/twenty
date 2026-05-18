import { WasIntroducedInUpgrade } from 'src/engine/core-modules/upgrade/decorators/was-introduced-in-upgrade.decorator';
import { WasRenamedInUpgrade } from 'src/engine/core-modules/upgrade/decorators/was-renamed-in-upgrade.decorator';
import { validateUpgradeAwareEntityDecorators } from 'src/engine/core-modules/upgrade/utils/validate-upgrade-aware-entity-decorators.util';

describe('validateUpgradeAwareEntityDecorators', () => {
  const KNOWN_CMD = '2.6.0_KnownCommand_1700000000000';
  const KNOWN_RENAME_CMD = '2.6.0_KnownRename_1700000000001';
  const KNOWN_LATER_RENAME_CMD = '2.7.0_LaterRename_1800000000000';
  const UNKNOWN_CMD = '2.6.0_UnknownCommand_9999999999999';

  const buildStepNameToIndex = (names: string[]): ReadonlyMap<string, number> =>
    new Map(names.map((name, index) => [name, index]));

  it('should report no problems when every decorator references a known command', () => {
    @WasIntroducedInUpgrade({ upgradeCommandName: KNOWN_CMD })
    class IntroducedEntity {}

    @WasRenamedInUpgrade([
      { previousName: 'oldName', upgradeCommandName: KNOWN_RENAME_CMD },
    ])
    class RenamedEntity {}

    expect(
      validateUpgradeAwareEntityDecorators({
        entityClasses: [IntroducedEntity, RenamedEntity],
        stepNameToIndex: buildStepNameToIndex([KNOWN_CMD, KNOWN_RENAME_CMD]),
      }),
    ).toEqual([]);
  });

  it('should report a class-level unknown upgradeCommandName', () => {
    @WasIntroducedInUpgrade({ upgradeCommandName: UNKNOWN_CMD })
    class BrokenIntroduced {}

    const problems = validateUpgradeAwareEntityDecorators({
      entityClasses: [BrokenIntroduced],
      stepNameToIndex: buildStepNameToIndex([KNOWN_CMD]),
    });

    expect(problems).toEqual([
      {
        kind: 'unknown-step-name',
        entityName: 'BrokenIntroduced',
        decorator: '@WasIntroducedInUpgrade',
        scope: 'class',
        upgradeCommandName: UNKNOWN_CMD,
      },
    ]);
  });

  it('should report a rename history that is out of order versus the sequence', () => {
    @WasRenamedInUpgrade([
      { previousName: 'first', upgradeCommandName: KNOWN_LATER_RENAME_CMD },
      { previousName: 'second', upgradeCommandName: KNOWN_RENAME_CMD },
    ])
    class ReverseOrdered {}

    const problems = validateUpgradeAwareEntityDecorators({
      entityClasses: [ReverseOrdered],
      stepNameToIndex: buildStepNameToIndex([
        KNOWN_RENAME_CMD,
        KNOWN_LATER_RENAME_CMD,
      ]),
    });

    expect(problems).toEqual([
      {
        kind: 'rename-history-out-of-order',
        entityName: 'ReverseOrdered',
        scope: 'class',
        offendingUpgradeCommandName: KNOWN_RENAME_CMD,
        precedingUpgradeCommandName: KNOWN_LATER_RENAME_CMD,
      },
    ]);
  });
});
