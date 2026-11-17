import { ADD_JOB_CONFIG_TO_WORKFLOW_AND_LOGIC_FUNCTION_UPGRADE_COMMAND_NAME } from 'src/database/commands/upgrade-version-command/2-58/add-job-config-to-workflow-and-logic-function-upgrade-command-name.constant';
import { ADD_JOB_GROUPS_UPGRADE_COMMAND_NAME } from 'src/database/commands/upgrade-version-command/2-60/add-job-groups-upgrade-command-name.constant';
import { JobGroupEntity } from 'src/engine/core-modules/job-group/job-group.entity';
import { resolveEntityShapeAtUpgradeCursor } from 'src/engine/core-modules/upgrade/utils/resolve-entity-shape-at-upgrade-cursor.util';
import { WorkflowEntity } from 'src/engine/core-modules/workflow/entities/workflow.entity';
import { LogicFunctionEntity } from 'src/engine/metadata-modules/logic-function/logic-function.entity';

const JOB_COLUMNS = [
  { propertyName: 'jobConfig', databaseName: 'jobConfig' },
  { propertyName: 'jobGroupKeys', databaseName: 'jobGroupKeys' },
];

const BEFORE_JOB_GROUPS = [
  ADD_JOB_CONFIG_TO_WORKFLOW_AND_LOGIC_FUNCTION_UPGRADE_COMMAND_NAME,
];
const AFTER_JOB_GROUPS = [
  ...BEFORE_JOB_GROUPS,
  ADD_JOB_GROUPS_UPGRADE_COMMAND_NAME,
];

describe.each([
  { entityClass: WorkflowEntity, currentTableName: 'workflow' },
  { entityClass: LogicFunctionEntity, currentTableName: 'logicFunction' },
])(
  '$currentTableName job groups upgrade shape',
  ({ entityClass, currentTableName }) => {
    const resolveHiddenPropertyNames = (appliedSteps: string[]) =>
      resolveEntityShapeAtUpgradeCursor({
        entityClass,
        currentTableName,
        currentColumns: JOB_COLUMNS,
        isStepApplied: (stepName) => appliedSteps.includes(stepName),
      }).hiddenPropertyNames;

    it('reads jobConfig until the job groups command has run', () => {
      expect([...resolveHiddenPropertyNames(BEFORE_JOB_GROUPS)]).toEqual([
        'jobGroupKeys',
      ]);
    });

    it('reads jobGroupKeys once the job groups command has run', () => {
      expect([...resolveHiddenPropertyNames(AFTER_JOB_GROUPS)]).toEqual([
        'jobConfig',
      ]);
    });
  },
);

describe('jobGroup upgrade shape', () => {
  it.each([
    { appliedSteps: BEFORE_JOB_GROUPS, isAvailable: false },
    { appliedSteps: AFTER_JOB_GROUPS, isAvailable: true },
  ])(
    'is available only once the job groups command has run ($isAvailable)',
    ({ appliedSteps, isAvailable }) => {
      expect(
        resolveEntityShapeAtUpgradeCursor({
          entityClass: JobGroupEntity,
          currentTableName: 'jobGroup',
          currentColumns: [],
          isStepApplied: (stepName) => appliedSteps.includes(stepName),
        }).isAvailable,
      ).toBe(isAvailable);
    },
  );
});
