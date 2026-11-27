import { DROP_VIEW_DELETED_AT_UPGRADE_COMMAND_NAME } from 'src/database/commands/upgrade-version-command/2-66/drop-view-deleted-at-upgrade-command-name.constant';
import { getWasRemovedInUpgradePropertyMetadata } from 'src/engine/core-modules/upgrade/decorators/was-removed-in-upgrade.decorator';
import { ViewFieldGroupEntity } from 'src/engine/metadata-modules/view-field-group/entities/view-field-group.entity';
import { ViewFieldEntity } from 'src/engine/metadata-modules/view-field/entities/view-field.entity';
import { ViewFilterGroupEntity } from 'src/engine/metadata-modules/view-filter-group/entities/view-filter-group.entity';
import { ViewFilterEntity } from 'src/engine/metadata-modules/view-filter/entities/view-filter.entity';
import { ViewGroupEntity } from 'src/engine/metadata-modules/view-group/entities/view-group.entity';
import { ViewSortEntity } from 'src/engine/metadata-modules/view-sort/entities/view-sort.entity';
import { ViewEntity } from 'src/engine/metadata-modules/view/entities/view.entity';

describe('view deletedAt removal wiring', () => {
  it.each([
    ViewEntity,
    ViewFieldEntity,
    ViewFieldGroupEntity,
    ViewFilterEntity,
    ViewFilterGroupEntity,
    ViewGroupEntity,
    ViewSortEntity,
  ])('marks deletedAt on %p as removed by the drop command', (entityClass) => {
    expect(
      getWasRemovedInUpgradePropertyMetadata(entityClass).deletedAt
        ?.upgradeCommandName,
    ).toBe(DROP_VIEW_DELETED_AT_UPGRADE_COMMAND_NAME);
  });
});
