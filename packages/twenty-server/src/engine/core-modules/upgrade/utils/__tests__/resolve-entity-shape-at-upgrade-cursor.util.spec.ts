import { WasIntroducedInUpgrade } from 'src/engine/core-modules/upgrade/decorators/was-introduced-in-upgrade.decorator';
import { WasRemovedInUpgrade } from 'src/engine/core-modules/upgrade/decorators/was-removed-in-upgrade.decorator';
import { WasRenamedInUpgrade } from 'src/engine/core-modules/upgrade/decorators/was-renamed-in-upgrade.decorator';
import { resolveEntityShapeAtUpgradeCursor } from 'src/engine/core-modules/upgrade/utils/resolve-entity-shape-at-upgrade-cursor.util';

const INTRODUCE_CMD = '2.7.0_IntroduceCommand_1800000000000';
const RENAME_CMD = '2.6.0_RenameCommand_1700000000000';
const PROP_INTRODUCE_CMD = '2.7.0_AddColumnCommand_1800000000001';
const PROP_RENAME_CMD = '2.6.0_RenameColumnCommand_1700000000001';
const PROP_REMOVE_CMD = '2.7.0_DropColumnCommand_1800000000002';

const buildPredicate = (applied: string[]) => {
  const set = new Set(applied);

  return (stepName: string) => set.has(stepName);
};

describe('resolveEntityShapeAtUpgradeCursor', () => {
  describe('class-level @WasIntroducedInUpgrade', () => {
    @WasIntroducedInUpgrade({ upgradeCommandName: INTRODUCE_CMD })
    class IntroducedEntity {}

    it('should mark entity unavailable before its introduction step applied', () => {
      const result = resolveEntityShapeAtUpgradeCursor({
        entityClass: IntroducedEntity,
        currentTableName: 'introducedEntity',
        currentColumns: [],
        isStepApplied: buildPredicate([]),
      });

      expect(result.isAvailable).toBe(false);
    });

    it('should mark entity available once introduction applied', () => {
      const result = resolveEntityShapeAtUpgradeCursor({
        entityClass: IntroducedEntity,
        currentTableName: 'introducedEntity',
        currentColumns: [],
        isStepApplied: buildPredicate([INTRODUCE_CMD]),
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
      const result = resolveEntityShapeAtUpgradeCursor({
        entityClass: RenamedEntity,
        currentTableName: 'newEntity',
        currentColumns: [],
        isStepApplied: buildPredicate([]),
      });

      expect(result.effectiveTableName).toBe('oldEntity');
      expect(result.isAvailable).toBe(true);
    });

    it('should report current table name once rename applied', () => {
      const result = resolveEntityShapeAtUpgradeCursor({
        entityClass: RenamedEntity,
        currentTableName: 'newEntity',
        currentColumns: [],
        isStepApplied: buildPredicate([RENAME_CMD]),
      });

      expect(result.effectiveTableName).toBe('newEntity');
    });

    it('should walk a multi-step rename history chronologically', () => {
      const FIRST_RENAME_CMD = '2.5.0_FirstRename_1600000000000';
      const SECOND_RENAME_CMD = '2.6.0_SecondRename_1700000000000';

      @WasRenamedInUpgrade([
        { previousName: 'firstName', upgradeCommandName: FIRST_RENAME_CMD },
        { previousName: 'secondName', upgradeCommandName: SECOND_RENAME_CMD },
      ])
      class TwiceRenamedEntity {}

      expect(
        resolveEntityShapeAtUpgradeCursor({
          entityClass: TwiceRenamedEntity,
          currentTableName: 'thirdName',
          currentColumns: [],
          isStepApplied: buildPredicate([]),
        }).effectiveTableName,
      ).toBe('firstName');

      expect(
        resolveEntityShapeAtUpgradeCursor({
          entityClass: TwiceRenamedEntity,
          currentTableName: 'thirdName',
          currentColumns: [],
          isStepApplied: buildPredicate([FIRST_RENAME_CMD]),
        }).effectiveTableName,
      ).toBe('secondName');

      expect(
        resolveEntityShapeAtUpgradeCursor({
          entityClass: TwiceRenamedEntity,
          currentTableName: 'thirdName',
          currentColumns: [],
          isStepApplied: buildPredicate([FIRST_RENAME_CMD, SECOND_RENAME_CMD]),
        }).effectiveTableName,
      ).toBe('thirdName');
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
      const result = resolveEntityShapeAtUpgradeCursor({
        entityClass: EntityWithProperties,
        currentTableName: 'entityWithProperties',
        currentColumns,
        isStepApplied: buildPredicate([]),
      });

      expect(result.hiddenPropertyNames).toEqual(new Set(['newColumn']));
      expect(Object.fromEntries(result.columnDatabaseNameRemap)).toEqual({
        renamedColumn: 'oldColumn',
      });
    });

    it('should leave both alone once both steps applied', () => {
      const result = resolveEntityShapeAtUpgradeCursor({
        entityClass: EntityWithProperties,
        currentTableName: 'entityWithProperties',
        currentColumns,
        isStepApplied: buildPredicate([PROP_INTRODUCE_CMD, PROP_RENAME_CMD]),
      });

      expect(result.hiddenPropertyNames.size).toBe(0);
      expect(result.columnDatabaseNameRemap.size).toBe(0);
    });

    it('should leave undecorated columns untouched in all cases', () => {
      const result = resolveEntityShapeAtUpgradeCursor({
        entityClass: EntityWithProperties,
        currentTableName: 'entityWithProperties',
        currentColumns,
        isStepApplied: buildPredicate([]),
      });

      expect(result.hiddenPropertyNames.has('untouchedColumn')).toBe(false);
      expect(result.columnDatabaseNameRemap.has('untouchedColumn')).toBe(false);
    });
  });

  describe('class-level properties form (inherited columns)', () => {
    @WasIntroducedInUpgrade({
      upgradeCommandName: PROP_INTRODUCE_CMD,
      properties: ['inheritedColumn', 'localColumn'],
    })
    class EntityWithInheritedColumns {}

    const currentColumns = [
      { propertyName: 'inheritedColumn', databaseName: 'inheritedColumn' },
      { propertyName: 'localColumn', databaseName: 'localColumn' },
      { propertyName: 'baselineColumn', databaseName: 'baselineColumn' },
    ];

    it('hides the listed inherited columns before introduction applied', () => {
      const result = resolveEntityShapeAtUpgradeCursor({
        entityClass: EntityWithInheritedColumns,
        currentTableName: 'entityWithInheritedColumns',
        currentColumns,
        isStepApplied: buildPredicate([]),
      });

      expect(result.isAvailable).toBe(true);
      expect(result.hiddenPropertyNames).toEqual(
        new Set(['inheritedColumn', 'localColumn']),
      );
    });

    it('exposes the listed columns once introduction applied', () => {
      const result = resolveEntityShapeAtUpgradeCursor({
        entityClass: EntityWithInheritedColumns,
        currentTableName: 'entityWithInheritedColumns',
        currentColumns,
        isStepApplied: buildPredicate([PROP_INTRODUCE_CMD]),
      });

      expect(result.hiddenPropertyNames.size).toBe(0);
    });

    it('never hides undecorated baseline columns', () => {
      for (const applied of [[], [PROP_INTRODUCE_CMD]] as string[][]) {
        const result = resolveEntityShapeAtUpgradeCursor({
          entityClass: EntityWithInheritedColumns,
          currentTableName: 'entityWithInheritedColumns',
          currentColumns,
          isStepApplied: buildPredicate(applied),
        });

        expect(result.hiddenPropertyNames.has('baselineColumn')).toBe(false);
      }
    });
  });

  describe('property-level @WasRemovedInUpgrade', () => {
    class EntityWithRemovedColumn {
      @WasRemovedInUpgrade({ upgradeCommandName: PROP_REMOVE_CMD })
      removedColumn!: string;

      untouchedColumn!: string;
    }

    const currentColumns = [
      { propertyName: 'removedColumn', databaseName: 'removedColumn' },
      { propertyName: 'untouchedColumn', databaseName: 'untouchedColumn' },
    ];

    it('should not hide the column before its removal step applied', () => {
      const result = resolveEntityShapeAtUpgradeCursor({
        entityClass: EntityWithRemovedColumn,
        currentTableName: 'entityWithRemovedColumn',
        currentColumns,
        isStepApplied: buildPredicate([]),
      });

      expect(result.hiddenPropertyNames.size).toBe(0);
    });

    it('should hide the column once its removal step applied', () => {
      const result = resolveEntityShapeAtUpgradeCursor({
        entityClass: EntityWithRemovedColumn,
        currentTableName: 'entityWithRemovedColumn',
        currentColumns,
        isStepApplied: buildPredicate([PROP_REMOVE_CMD]),
      });

      expect(result.hiddenPropertyNames).toEqual(new Set(['removedColumn']));
    });

    it('should leave undecorated siblings untouched at every cursor', () => {
      for (const applied of [[], [PROP_REMOVE_CMD]] as string[][]) {
        const result = resolveEntityShapeAtUpgradeCursor({
          entityClass: EntityWithRemovedColumn,
          currentTableName: 'entityWithRemovedColumn',
          currentColumns,
          isStepApplied: buildPredicate(applied),
        });

        expect(result.hiddenPropertyNames.has('untouchedColumn')).toBe(false);
      }
    });
  });

  describe('property-level intro + remove combined', () => {
    class EntityWithIntroAndRemove {
      @WasIntroducedInUpgrade({ upgradeCommandName: PROP_INTRODUCE_CMD })
      @WasRemovedInUpgrade({ upgradeCommandName: PROP_REMOVE_CMD })
      transientColumn!: string;
    }

    const currentColumns = [
      { propertyName: 'transientColumn', databaseName: 'transientColumn' },
    ];

    it('hides the column before intro applied', () => {
      const result = resolveEntityShapeAtUpgradeCursor({
        entityClass: EntityWithIntroAndRemove,
        currentTableName: 'entityWithIntroAndRemove',
        currentColumns,
        isStepApplied: buildPredicate([]),
      });

      expect(result.hiddenPropertyNames).toEqual(new Set(['transientColumn']));
    });

    it('exposes the column between intro and removal', () => {
      const result = resolveEntityShapeAtUpgradeCursor({
        entityClass: EntityWithIntroAndRemove,
        currentTableName: 'entityWithIntroAndRemove',
        currentColumns,
        isStepApplied: buildPredicate([PROP_INTRODUCE_CMD]),
      });

      expect(result.hiddenPropertyNames.size).toBe(0);
    });

    it('hides the column once removal applied', () => {
      const result = resolveEntityShapeAtUpgradeCursor({
        entityClass: EntityWithIntroAndRemove,
        currentTableName: 'entityWithIntroAndRemove',
        currentColumns,
        isStepApplied: buildPredicate([PROP_INTRODUCE_CMD, PROP_REMOVE_CMD]),
      });

      expect(result.hiddenPropertyNames).toEqual(new Set(['transientColumn']));
    });
  });

  it('should treat an entity with no decorators as available and unchanged', () => {
    class Plain {}

    const result = resolveEntityShapeAtUpgradeCursor({
      entityClass: Plain,
      currentTableName: 'plain',
      currentColumns: [{ propertyName: 'id', databaseName: 'id' }],
      isStepApplied: buildPredicate([]),
    });

    expect(result.isAvailable).toBe(true);
    expect(result.effectiveTableName).toBe('plain');
    expect(result.hiddenPropertyNames.size).toBe(0);
    expect(result.columnDatabaseNameRemap.size).toBe(0);
  });
});
