import {
  getWasRenamedInUpgradeClassMetadata,
  getWasRenamedInUpgradePropertyMetadata,
  WasRenamedInUpgrade,
} from 'src/engine/core-modules/upgrade/decorators/was-renamed-in-upgrade.decorator';

describe('WasRenamedInUpgrade', () => {
  it('should store rename history on the class when applied at class level', () => {
    @WasRenamedInUpgrade([
      {
        previousName: 'oldEntity',
        upgradeCommandName: '2.6.0_RenameCommand_1700000000000',
      },
    ])
    class Renamed {}

    expect(getWasRenamedInUpgradeClassMetadata(Renamed)).toEqual([
      {
        previousName: 'oldEntity',
        upgradeCommandName: '2.6.0_RenameCommand_1700000000000',
      },
    ]);
  });

  it('should return undefined for class without decorator', () => {
    class Bare {}

    expect(getWasRenamedInUpgradeClassMetadata(Bare)).toBeUndefined();
    expect(getWasRenamedInUpgradePropertyMetadata(Bare)).toEqual({});
  });

  it('should preserve multi-step rename history in order', () => {
    @WasRenamedInUpgrade([
      {
        previousName: 'firstName',
        upgradeCommandName: '2.6.0_FirstRename_1700000000000',
      },
      {
        previousName: 'secondName',
        upgradeCommandName: '2.7.0_SecondRename_1800000000000',
      },
    ])
    class TwiceRenamed {}

    const history = getWasRenamedInUpgradeClassMetadata(TwiceRenamed);

    expect(history).toHaveLength(2);
    expect(history?.[0].previousName).toBe('firstName');
    expect(history?.[1].previousName).toBe('secondName');
  });

  it('should accumulate property-level rename histories independently', () => {
    class Mixed {
      @WasRenamedInUpgrade([
        {
          previousName: 'oldAlpha',
          upgradeCommandName: '2.6.0_RenameAlpha_1700000000000',
        },
      ])
      alpha!: string;

      @WasRenamedInUpgrade([
        {
          previousName: 'oldBeta',
          upgradeCommandName: '2.7.0_RenameBeta_1800000000000',
        },
      ])
      beta!: string;
    }

    expect(getWasRenamedInUpgradePropertyMetadata(Mixed)).toEqual({
      alpha: [
        {
          previousName: 'oldAlpha',
          upgradeCommandName: '2.6.0_RenameAlpha_1700000000000',
        },
      ],
      beta: [
        {
          previousName: 'oldBeta',
          upgradeCommandName: '2.7.0_RenameBeta_1800000000000',
        },
      ],
    });
  });
});
