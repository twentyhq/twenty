import { ADD_WORKSPACE_ASSISTANT_PROFILE_UPGRADE_COMMAND_NAME } from 'src/database/commands/upgrade-version-command/2-56/add-workspace-assistant-profile-upgrade-command-name.constant';
import { ADD_AI_DATA_POLICY_TO_WORKSPACE_UPGRADE_COMMAND_NAME } from 'src/database/commands/upgrade-version-command/2-57/add-ai-data-policy-to-workspace-upgrade-command-name.constant';
import { resolveEntityShapeAtUpgradeCursor } from 'src/engine/core-modules/upgrade/utils/resolve-entity-shape-at-upgrade-cursor.util';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';

const ASSISTANT_PROFILE_COLUMN = 'aiChatAssistantProfile';
const CURRENT_COLUMNS = ['id', ASSISTANT_PROFILE_COLUMN].map(
  (propertyName) => ({ propertyName, databaseName: propertyName }),
);

const resolveWorkspaceUpgradeShape = (appliedSteps: string[]) =>
  resolveEntityShapeAtUpgradeCursor({
    entityClass: WorkspaceEntity,
    currentTableName: 'workspace',
    currentColumns: CURRENT_COLUMNS,
    isStepApplied: (stepName) => appliedSteps.includes(stepName),
  });

describe('WorkspaceEntity AI data policy upgrade shape', () => {
  const resolveHiddenPropertyNames = (appliedSteps: string[]) =>
    resolveEntityShapeAtUpgradeCursor({
      entityClass: WorkspaceEntity,
      currentTableName: 'workspace',
      currentColumns: [
        { propertyName: 'aiDataPolicy', databaseName: 'aiDataPolicy' },
      ],
      isStepApplied: (stepName) => appliedSteps.includes(stepName),
    }).hiddenPropertyNames;

  it('hides the policy column until its upgrade command has run', () => {
    expect(resolveHiddenPropertyNames([])).toEqual(new Set(['aiDataPolicy']));
    expect(
      resolveHiddenPropertyNames([
        ADD_AI_DATA_POLICY_TO_WORKSPACE_UPGRADE_COMMAND_NAME,
      ]),
    ).toEqual(new Set());
  });
});

describe('WorkspaceEntity assistant profile upgrade shape', () => {
  it('hides the assistant profile column while preserving id before introduction', () => {
    expect(resolveWorkspaceUpgradeShape([]).hiddenPropertyNames).toEqual(
      new Set([ASSISTANT_PROFILE_COLUMN]),
    );
  });

  it('reveals the assistant profile column and preserves id after introduction', () => {
    expect(
      resolveWorkspaceUpgradeShape([
        ADD_WORKSPACE_ASSISTANT_PROFILE_UPGRADE_COMMAND_NAME,
      ]).hiddenPropertyNames,
    ).toEqual(new Set());
  });
});
