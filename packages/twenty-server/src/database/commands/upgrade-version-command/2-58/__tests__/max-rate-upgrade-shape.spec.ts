import { ADD_MAX_RATE_TO_WORKFLOW_AND_LOGIC_FUNCTION_UPGRADE_COMMAND_NAME } from 'src/database/commands/upgrade-version-command/2-58/add-max-rate-to-workflow-and-logic-function-upgrade-command-name.constant';
import { resolveEntityShapeAtUpgradeCursor } from 'src/engine/core-modules/upgrade/utils/resolve-entity-shape-at-upgrade-cursor.util';
import { WorkflowEntity } from 'src/engine/core-modules/workflow/entities/workflow.entity';
import { LogicFunctionEntity } from 'src/engine/metadata-modules/logic-function/logic-function.entity';

const MAX_RATE_COLUMN = [{ propertyName: 'maxRate', databaseName: 'maxRate' }];

describe.each([
  { entityClass: WorkflowEntity, currentTableName: 'workflow' },
  { entityClass: LogicFunctionEntity, currentTableName: 'logicFunction' },
])('$currentTableName maxRate upgrade shape', ({ entityClass, currentTableName }) => {
  const resolveAt = (appliedSteps: string[]) =>
    resolveEntityShapeAtUpgradeCursor({
      entityClass,
      currentTableName,
      currentColumns: MAX_RATE_COLUMN,
      isStepApplied: (stepName) => appliedSteps.includes(stepName),
    });

  it('hides maxRate until its instance command has run', () => {
    expect(resolveAt([]).hiddenPropertyNames.has('maxRate')).toBe(true);
    expect(
      resolveAt([
        ADD_MAX_RATE_TO_WORKFLOW_AND_LOGIC_FUNCTION_UPGRADE_COMMAND_NAME,
      ]).hiddenPropertyNames.has('maxRate'),
    ).toBe(false);
  });
});
