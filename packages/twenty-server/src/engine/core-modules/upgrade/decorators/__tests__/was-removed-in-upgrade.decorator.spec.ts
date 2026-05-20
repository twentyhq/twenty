import {
  WasRemovedInUpgrade,
  getWasRemovedInUpgradeClassMetadata,
  getWasRemovedInUpgradePropertyMetadata,
} from 'src/engine/core-modules/upgrade/decorators/was-removed-in-upgrade.decorator';

describe('WasRemovedInUpgrade', () => {
  it('records class-level metadata', () => {
    @WasRemovedInUpgrade({ upgradeCommandName: 'upgrade-step-class' })
    class Example {}

    expect(getWasRemovedInUpgradeClassMetadata(Example)).toEqual({
      upgradeCommandName: 'upgrade-step-class',
    });
    expect(getWasRemovedInUpgradePropertyMetadata(Example)).toEqual({});
  });

  it('records property-level metadata keyed by property name', () => {
    class Example {
      @WasRemovedInUpgrade({ upgradeCommandName: 'upgrade-step-foo' })
      foo!: string;

      @WasRemovedInUpgrade({ upgradeCommandName: 'upgrade-step-bar' })
      bar!: string;

      untouched!: string;
    }

    expect(getWasRemovedInUpgradePropertyMetadata(Example)).toEqual({
      foo: { upgradeCommandName: 'upgrade-step-foo' },
      bar: { upgradeCommandName: 'upgrade-step-bar' },
    });
    expect(getWasRemovedInUpgradeClassMetadata(Example)).toBeUndefined();
  });

  it('returns an empty map for classes with no decorated properties', () => {
    class Example {}

    expect(getWasRemovedInUpgradePropertyMetadata(Example)).toEqual({});
    expect(getWasRemovedInUpgradeClassMetadata(Example)).toBeUndefined();
  });
});
