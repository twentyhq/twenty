import { ADD_JOB_CONFIG_TO_WORKFLOW_AND_LOGIC_FUNCTION_UPGRADE_COMMAND_NAME } from 'src/database/commands/upgrade-version-command/2-58/add-job-config-to-workflow-and-logic-function-upgrade-command-name.constant';
import { resolveEntityShapeAtUpgradeCursor } from 'src/engine/core-modules/upgrade/utils/resolve-entity-shape-at-upgrade-cursor.util';
import { WorkflowEntity } from 'src/engine/core-modules/workflow/entities/workflow.entity';
import { LogicFunctionEntity } from 'src/engine/metadata-modules/logic-function/logic-function.entity';

const JOB_CONFIG_COLUMN = [{ propertyName: 'jobConfig', databaseName: 'jobConfig' }];

describe.each([
  { entityClass: WorkflowEntity, currentTableName: 'workflow' },
  { entityClass: LogicFunctionEntity, currentTableName: 'logicFunction' },
])('$currentTableName jobConfig upgrade shape', ({ entityClass, currentTableName }) => {
  const resolveAt = (appliedSteps: string[]) =>
    resolveEntityShapeAtUpgradeCursor({
      entityClass,
      currentTableName,
      currentColumns: JOB_CONFIG_COLUMN,
      isStepApplied: (stepName) => appliedSteps.includes(stepName),
    });

  it('hides jobConfig until its instance command has run', () => {
    expect(resolveAt([]).hiddenPropertyNames.has('jobConfig')).toBe(true);
    expect(
      resolveAt([
        ADD_JOB_CONFIG_TO_WORKFLOW_AND_LOGIC_FUNCTION_UPGRADE_COMMAND_NAME,
      ]).hiddenPropertyNames.has('jobConfig'),
    ).toBe(false);
  });
});
