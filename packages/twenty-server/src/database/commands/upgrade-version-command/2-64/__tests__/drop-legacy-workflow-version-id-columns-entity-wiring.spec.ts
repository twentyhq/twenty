import { DROP_LEGACY_WORKFLOW_VERSION_ID_COLUMNS_UPGRADE_COMMAND_NAME } from 'src/database/commands/upgrade-version-command/2-64/drop-legacy-workflow-version-id-columns-upgrade-command-name.constant';
import { TWENTY_NEXT_VERSIONS } from 'src/engine/core-modules/upgrade/constants/twenty-next-versions.constant';
import { getWasRemovedInUpgradePropertyMetadata } from 'src/engine/core-modules/upgrade/decorators/was-removed-in-upgrade.decorator';
import { WorkflowVersionEntity } from 'src/engine/core-modules/workflow/entities/workflow-version.entity';
import { WorkflowEntity } from 'src/engine/core-modules/workflow/entities/workflow.entity';

const nextVersions: readonly string[] = TWENTY_NEXT_VERSIONS;
const isDropCommandDormant = nextVersions.includes('2.64.0');

describe.each([
  {
    entityClass: WorkflowVersionEntity,
    propertyName: 'workspaceWorkflowVersionId',
  },
  { entityClass: WorkflowEntity, propertyName: 'lastPublishedVersionId' },
])('$propertyName removal wiring', ({ entityClass, propertyName }) => {
  it('marks the column as removed by the drop command once 2.64 is the current version', () => {
    expect(
      getWasRemovedInUpgradePropertyMetadata(entityClass)[propertyName]
        ?.upgradeCommandName,
    ).toBe(
      isDropCommandDormant
        ? undefined
        : DROP_LEGACY_WORKFLOW_VERSION_ID_COLUMNS_UPGRADE_COMMAND_NAME,
    );
  });
});
