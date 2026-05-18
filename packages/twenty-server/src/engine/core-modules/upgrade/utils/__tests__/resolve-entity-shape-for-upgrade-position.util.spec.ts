import { WasIntroducedInUpgrade } from 'src/engine/core-modules/upgrade/decorators/was-introduced-in-upgrade.decorator';
import { WasRenamedInUpgrade } from 'src/engine/core-modules/upgrade/decorators/was-renamed-in-upgrade.decorator';
import { resolveEntityShapeForUpgradePosition } from 'src/engine/core-modules/upgrade/utils/resolve-entity-shape-for-upgrade-position.util';

const INTRODUCE_CMD = '2.7.0_IntroduceCommand_1800000000000';
const RENAME_CMD = '2.6.0_RenameCommand_1700000000000';
const PROP_INTRODUCE_CMD = '2.7.0_AddColumnCommand_1800000000001';
const PROP_RENAME_CMD = '2.6.0_RenameColumnCommand_1700000000001';

const buildPosition = (applied: string[]) => ({
  appliedCommandNames: new Set(applied),
});

describe('resolveEntityShapeForUpgradePosition', () => {
  describe('class-level @WasIntroducedInUpgrade', () => {
    @WasIntroducedInUpgrade({ upgradeCommandName: INTRODUCE_CMD })
    class IntroducedEntity {}

    it('should mark entity unavailable before its introduction command applied', () => {
      const result = resolveEntityShapeForUpgradePosition({
        entityClass: IntroducedEntity,
        currentTableName: 'introducedEntity',
        currentColumns: [],
        position: buildPosition([]),
      });

      expect(result.isAvailable).toBe(false);
    });

    it('should mark entity available once introduction applied', () => {
      const result = resolveEntityShapeForUpgradePosition({
        entityClass: IntroducedEntity,
        currentTableName: 'introducedEntity',
        currentColumns: [],
        position: buildPosition([INTRODUCE_CMD]),
      });

      expect(result.isAvailable).toBe(true);
    });
  });

  describe('class-level @WasRenamedInUpgrade', () => {
    @WasRenamedInUpgrade([
      { previousName: 'oldEntity', upgradeCommandName: RENAME_CMD },
    ])
    class RenamedEntity {}

    it('should report historical table name when rename not yet applied', () => {
      const result = resolveEntityShapeForUpgradePosition({
        entityClass: RenamedEntity,
        currentTableName: 'newEntity',
        currentColumns: [],
        position: buildPosition([]),
      });

      expect(result.effectiveTableName).toBe('oldEntity');
      expect(result.isAvailable).toBe(true);
    });

    it('should report current table name once rename applied', () => {
      const result = resolveEntityShapeForUpgradePosition({
        entityClass: RenamedEntity,
        currentTableName: 'newEntity',
        currentColumns: [],
        position: buildPosition([RENAME_CMD]),
      });

      expect(result.effectiveTableName).toBe('newEntity');
    });
  });

  describe('property-level decorators', () => {
    class EntityWithProperties {
      @WasIntroducedInUpgrade({ upgradeCommandName: PROP_INTRODUCE_CMD })
      newColumn!: string;

      @WasRenamedInUpgrade([
        { previousName: 'oldColumn', upgradeCommandName: PROP_RENAME_CMD },
      ])
      renamedColumn!: string;

      untouchedColumn!: string;
    }

    const currentColumns = [
      { propertyName: 'newColumn', databaseName: 'newColumn' },
      { propertyName: 'renamedColumn', databaseName: 'renamedColumn' },
      { propertyName: 'untouchedColumn', databaseName: 'untouchedColumn' },
    ];

    it('should hide not-yet-introduced columns and remap not-yet-renamed columns', () => {
      const result = resolveEntityShapeForUpgradePosition({
        entityClass: EntityWithProperties,
        currentTableName: 'entityWithProperties',
        currentColumns,
        position: buildPosition([]),
      });

      expect(result.hiddenPropertyNames).toEqual(new Set(['newColumn']));
      expect(Object.fromEntries(result.columnDatabaseNameRemap)).toEqual({
        renamedColumn: 'oldColumn',
      });
    });

    it('should leave both alone once both commands applied', () => {
      const result = resolveEntityShapeForUpgradePosition({
        entityClass: EntityWithProperties,
        currentTableName: 'entityWithProperties',
        currentColumns,
        position: buildPosition([PROP_INTRODUCE_CMD, PROP_RENAME_CMD]),
      });

      expect(result.hiddenPropertyNames.size).toBe(0);
      expect(result.columnDatabaseNameRemap.size).toBe(0);
    });

    it('should leave undecorated columns untouched in all cases', () => {
      const result = resolveEntityShapeForUpgradePosition({
        entityClass: EntityWithProperties,
        currentTableName: 'entityWithProperties',
        currentColumns,
        position: buildPosition([]),
      });

      expect(result.hiddenPropertyNames.has('untouchedColumn')).toBe(false);
      expect(result.columnDatabaseNameRemap.has('untouchedColumn')).toBe(false);
    });
  });

  it('should treat an entity with no decorators as available and unchanged', () => {
    class Plain {}

    const result = resolveEntityShapeForUpgradePosition({
      entityClass: Plain,
      currentTableName: 'plain',
      currentColumns: [{ propertyName: 'id', databaseName: 'id' }],
      position: buildPosition([]),
    });

    expect(result.isAvailable).toBe(true);
    expect(result.effectiveTableName).toBe('plain');
    expect(result.hiddenPropertyNames.size).toBe(0);
    expect(result.columnDatabaseNameRemap.size).toBe(0);
  });
});
