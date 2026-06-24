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

  describe('class-level properties form (for inherited columns)', () => {
    it('registers the listed properties in the property-introduction map', () => {
      @WasIntroducedInUpgrade({
        upgradeCommandName: 'upgrade-step-columns',
        properties: ['inheritedA', 'inheritedB'],
      })
      class Example {}

      expect(getWasIntroducedInUpgradePropertyMetadata(Example)).toEqual({
        inheritedA: { upgradeCommandName: 'upgrade-step-columns' },
        inheritedB: { upgradeCommandName: 'upgrade-step-columns' },
      });
    });

    it('does not mark the entity itself as introduced', () => {
      @WasIntroducedInUpgrade({
        upgradeCommandName: 'upgrade-step-columns',
        properties: ['inheritedA'],
      })
      class Example {}

      expect(getWasIntroducedInUpgradeClassMetadata(Example)).toBeUndefined();
    });

    it('merges with property-level decorators on the same entity', () => {
      @WasIntroducedInUpgrade({
        upgradeCommandName: 'upgrade-step-inherited',
        properties: ['inheritedA'],
      })
      class Example {
        @WasIntroducedInUpgrade({ upgradeCommandName: 'upgrade-step-local' })
        localColumn!: string;
      }

      expect(getWasIntroducedInUpgradePropertyMetadata(Example)).toEqual({
        localColumn: { upgradeCommandName: 'upgrade-step-local' },
        inheritedA: { upgradeCommandName: 'upgrade-step-inherited' },
      });
    });
  });

  it('returns an empty map for classes with no decorated properties', () => {
    class Example {}

    expect(getWasIntroducedInUpgradePropertyMetadata(Example)).toEqual({});
    expect(getWasIntroducedInUpgradeClassMetadata(Example)).toBeUndefined();
  });
});
