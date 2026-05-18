import { WasIntroducedInUpgrade } from 'src/engine/core-modules/upgrade/decorators/was-introduced-in-upgrade.decorator';
import { WasRenamedInUpgrade } from 'src/engine/core-modules/upgrade/decorators/was-renamed-in-upgrade.decorator';
import { validateUpgradeAwareEntityDecorators } from 'src/engine/core-modules/upgrade/utils/validate-upgrade-aware-entity-decorators.util';

describe('validateUpgradeAwareEntityDecorators', () => {
  const KNOWN_CMD = '2.6.0_KnownCommand_1700000000000';
  const KNOWN_RENAME_CMD = '2.6.0_KnownRename_1700000000001';
  const UNKNOWN_CMD = '2.6.0_UnknownCommand_9999999999999';

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
        knownCommandNames: new Set([KNOWN_CMD, KNOWN_RENAME_CMD]),
      }),
    ).toEqual([]);
  });

  it('should report a class-level unknown upgradeCommandName', () => {
    @WasIntroducedInUpgrade({ upgradeCommandName: UNKNOWN_CMD })
    class BrokenIntroduced {}

    const problems = validateUpgradeAwareEntityDecorators({
      entityClasses: [BrokenIntroduced],
      knownCommandNames: new Set([KNOWN_CMD]),
    });

    expect(problems).toEqual([
      {
        entityName: 'BrokenIntroduced',
        decorator: '@WasIntroducedInUpgrade',
        scope: 'class',
        upgradeCommandName: UNKNOWN_CMD,
      },
    ]);
  });

  it('should report a property-level unknown upgradeCommandName for both decorators', () => {
    class BrokenProperty {
      @WasIntroducedInUpgrade({ upgradeCommandName: UNKNOWN_CMD })
      newField!: string;

      @WasRenamedInUpgrade([
        { previousName: 'old', upgradeCommandName: UNKNOWN_CMD },
      ])
      renamedField!: string;
    }

    const problems = validateUpgradeAwareEntityDecorators({
      entityClasses: [BrokenProperty],
      knownCommandNames: new Set([KNOWN_CMD]),
    });

    expect(problems).toEqual([
      {
        entityName: 'BrokenProperty',
        decorator: '@WasIntroducedInUpgrade',
        scope: 'property:newField',
        upgradeCommandName: UNKNOWN_CMD,
      },
      {
        entityName: 'BrokenProperty',
        decorator: '@WasRenamedInUpgrade',
        scope: 'property:renamedField',
        upgradeCommandName: UNKNOWN_CMD,
      },
    ]);
  });

  it('should report each unknown entry inside a multi-step rename history', () => {
    @WasRenamedInUpgrade([
      { previousName: 'firstOld', upgradeCommandName: KNOWN_CMD },
      { previousName: 'secondOld', upgradeCommandName: UNKNOWN_CMD },
    ])
    class HalfBroken {}

    const problems = validateUpgradeAwareEntityDecorators({
      entityClasses: [HalfBroken],
      knownCommandNames: new Set([KNOWN_CMD]),
    });

    expect(problems).toEqual([
      {
        entityName: 'HalfBroken',
        decorator: '@WasRenamedInUpgrade',
        scope: 'class',
        upgradeCommandName: UNKNOWN_CMD,
      },
    ]);
  });
});
