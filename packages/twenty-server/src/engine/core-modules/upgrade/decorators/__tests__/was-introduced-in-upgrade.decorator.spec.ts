import {
  WasIntroducedInUpgrade,
  getWasIntroducedInUpgradeClassMetadata,
  getWasIntroducedInUpgradePropertyMetadata,
} from 'src/engine/core-modules/upgrade/decorators/was-introduced-in-upgrade.decorator';

describe('WasIntroducedInUpgrade', () => {
  it('records class-level entity introduction metadata', () => {
    @WasIntroducedInUpgrade({ upgradeCommandName: 'upgrade-step-class' })
    class Example {}

    expect(getWasIntroducedInUpgradeClassMetadata(Example)).toEqual({
      upgradeCommandName: 'upgrade-step-class',
    });
    expect(getWasIntroducedInUpgradePropertyMetadata(Example)).toEqual({});
  });

  it('records property-level metadata keyed by property name', () => {
    class Example {
      @WasIntroducedInUpgrade({ upgradeCommandName: 'upgrade-step-foo' })
      foo!: string;

      @WasIntroducedInUpgrade({ upgradeCommandName: 'upgrade-step-bar' })
      bar!: string;

      untouched!: string;
    }

    expect(getWasIntroducedInUpgradePropertyMetadata(Example)).toEqual({
      foo: { upgradeCommandName: 'upgrade-step-foo' },
      bar: { upgradeCommandName: 'upgrade-step-bar' },
    });
    expect(getWasIntroducedInUpgradeClassMetadata(Example)).toBeUndefined();
  });

  it('returns an empty map for classes with no decorated properties', () => {
    class Example {}

    expect(getWasIntroducedInUpgradePropertyMetadata(Example)).toEqual({});
    expect(getWasIntroducedInUpgradeClassMetadata(Example)).toBeUndefined();
  });
});
