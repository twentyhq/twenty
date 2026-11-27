import { DROP_VIEW_VISIBILITY_UPGRADE_COMMAND_NAME } from 'src/database/commands/upgrade-version-command/2-65/drop-view-visibility-upgrade-command-name.constant';
import { TWENTY_NEXT_VERSIONS } from 'src/engine/core-modules/upgrade/constants/twenty-next-versions.constant';
import { getWasRemovedInUpgradePropertyMetadata } from 'src/engine/core-modules/upgrade/decorators/was-removed-in-upgrade.decorator';
import { ViewEntity } from 'src/engine/metadata-modules/view/entities/view.entity';

const nextVersions: readonly string[] = TWENTY_NEXT_VERSIONS;
const isDropCommandDormant = nextVersions.includes('2.65.0');

describe('view visibility removal wiring', () => {
  it('marks visibility as removed by the drop command once 2.65 is the current version', () => {
    expect(
      getWasRemovedInUpgradePropertyMetadata(ViewEntity).visibility
        ?.upgradeCommandName,
    ).toBe(
      isDropCommandDormant
        ? undefined
        : DROP_VIEW_VISIBILITY_UPGRADE_COMMAND_NAME,
    );
  });
});
