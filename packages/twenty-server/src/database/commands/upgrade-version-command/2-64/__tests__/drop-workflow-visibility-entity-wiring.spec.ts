import { DROP_WORKFLOW_VISIBILITY_UPGRADE_COMMAND_NAME } from 'src/database/commands/upgrade-version-command/2-64/drop-workflow-visibility-upgrade-command-name.constant';
import { TWENTY_NEXT_VERSIONS } from 'src/engine/core-modules/upgrade/constants/twenty-next-versions.constant';
import { getWasRemovedInUpgradePropertyMetadata } from 'src/engine/core-modules/upgrade/decorators/was-removed-in-upgrade.decorator';
import { WorkflowEntity } from 'src/engine/core-modules/workflow/entities/workflow.entity';

const nextVersions: readonly string[] = TWENTY_NEXT_VERSIONS;
const isDropCommandDormant = nextVersions.includes('2.64.0');

describe('workflow visibility removal wiring', () => {
  it('marks visibility as removed by the drop command once 2.64 is the current version', () => {
    expect(
      getWasRemovedInUpgradePropertyMetadata(WorkflowEntity).visibility
        ?.upgradeCommandName,
    ).toBe(
      isDropCommandDormant
        ? undefined
        : DROP_WORKFLOW_VISIBILITY_UPGRADE_COMMAND_NAME,
    );
  });
});
