import {
  getWasIntroducedInUpgradeClassMetadata,
  getWasIntroducedInUpgradePropertyMetadata,
  WasIntroducedInUpgrade,
} from 'src/engine/core-modules/upgrade/decorators/was-introduced-in-upgrade.decorator';

describe('WasIntroducedInUpgrade', () => {
  it('should store options on the class when applied at class level', () => {
    @WasIntroducedInUpgrade({
      upgradeCommandName: '2.6.0_AlphaCommand_1700000000000',
    })
    class Alpha {}

    expect(getWasIntroducedInUpgradeClassMetadata(Alpha)).toEqual({
      upgradeCommandName: '2.6.0_AlphaCommand_1700000000000',
    });
    expect(getWasIntroducedInUpgradePropertyMetadata(Alpha)).toEqual({});
  });

  it('should return undefined when the class has no decorator', () => {
    class Bare {}

    expect(getWasIntroducedInUpgradeClassMetadata(Bare)).toBeUndefined();
    expect(getWasIntroducedInUpgradePropertyMetadata(Bare)).toEqual({});
  });

  it('should accumulate options across multiple properties', () => {
    class Beta {
      @WasIntroducedInUpgrade({
        upgradeCommandName: '2.6.0_BetaCommand_1700000000001',
      })
      addedFirst!: string;

      @WasIntroducedInUpgrade({
        upgradeCommandName: '2.7.0_BetaCommand_1800000000000',
      })
      addedLater!: string;
    }

    expect(getWasIntroducedInUpgradePropertyMetadata(Beta)).toEqual({
      addedFirst: {
        upgradeCommandName: '2.6.0_BetaCommand_1700000000001',
      },
      addedLater: {
        upgradeCommandName: '2.7.0_BetaCommand_1800000000000',
      },
    });
  });

  it('should allow class and property metadata to coexist', () => {
    @WasIntroducedInUpgrade({
      upgradeCommandName: '2.6.0_GammaCommand_1700000000000',
    })
    class Gamma {
      @WasIntroducedInUpgrade({
        upgradeCommandName: '2.7.0_GammaCommand_1800000000001',
      })
      newColumn!: string;
    }

    expect(getWasIntroducedInUpgradeClassMetadata(Gamma)).toEqual({
      upgradeCommandName: '2.6.0_GammaCommand_1700000000000',
    });
    expect(getWasIntroducedInUpgradePropertyMetadata(Gamma)).toEqual({
      newColumn: {
        upgradeCommandName: '2.7.0_GammaCommand_1800000000001',
      },
    });
  });
});
