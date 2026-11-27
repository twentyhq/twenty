import { DROP_JOB_CONFIG_UPGRADE_COMMAND_NAME } from 'src/database/commands/upgrade-version-command/2-61/drop-job-config-upgrade-command-name.constant';
import { TWENTY_NEXT_VERSIONS } from 'src/engine/core-modules/upgrade/constants/twenty-next-versions.constant';
import { getWasRemovedInUpgradePropertyMetadata } from 'src/engine/core-modules/upgrade/decorators/was-removed-in-upgrade.decorator';
import { WorkflowEntity } from 'src/engine/core-modules/workflow/entities/workflow.entity';
import { LogicFunctionEntity } from 'src/engine/metadata-modules/logic-function/logic-function.entity';

// A decorator naming a dormant command fails boot, so the wiring can only land once 2.61 is current.
// Without it the command drops a column the entities still select.
const nextVersions: readonly string[] = TWENTY_NEXT_VERSIONS;
const isDropCommandDormant = nextVersions.includes('2.61.0');

describe.each([
  { entityName: 'workflow', entityClass: WorkflowEntity },
  { entityName: 'logicFunction', entityClass: LogicFunctionEntity },
])('$entityName jobConfig removal wiring', ({ entityClass }) => {
  const jobConfigRemoval =
    getWasRemovedInUpgradePropertyMetadata(entityClass).jobConfig;

  it('marks jobConfig as removed by the drop command once 2.61 is the current version', () => {
    expect(jobConfigRemoval?.upgradeCommandName).toBe(
      isDropCommandDormant ? undefined : DROP_JOB_CONFIG_UPGRADE_COMMAND_NAME,
    );
  });
});
