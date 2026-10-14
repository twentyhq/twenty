import { type WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { AddAgentBuildingSkillCommand } from 'src/database/commands/upgrade-version-command/2-47/2-47-workspace-command-1791906324176-add-agent-building-skill.command';
import { type ApplicationService } from 'src/engine/core-modules/application/application.service';
import { type WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { STANDARD_SKILL } from 'src/engine/workspace-manager/twenty-standard-application/constants/standard-skill.constant';
import { type WorkspaceMigrationValidateBuildAndRunService } from 'src/engine/workspace-manager/workspace-migration/services/workspace-migration-validate-build-and-run-service';

const WORKSPACE_ID = '20202020-0000-0000-0000-000000000001';
const STANDARD_APPLICATION_ID = '20202020-0000-0000-0000-0000000000a1';
const AGENT_BUILDING_SKILL_UNIVERSAL_IDENTIFIER =
  STANDARD_SKILL['agent-building'].universalIdentifier;

const buildExistingSkill = ({
  universalIdentifier,
  name,
}: {
  universalIdentifier: string;
  name: string;
}) => ({
  id: `id-${universalIdentifier}`,
  universalIdentifier,
  applicationId: STANDARD_APPLICATION_ID,
  workspaceId: WORKSPACE_ID,
  name,
  label: name,
  description: null,
  icon: null,
  content: 'content',
  isCustom: true,
  isSystem: false,
  isActive: true,
});

const setup = (existingSkills: ReturnType<typeof buildExistingSkill>[]) => {
  const validateBuildAndRunLegacyWorkspaceMigration = jest
    .fn()
    .mockResolvedValue({ status: 'success' });

  const command = new AddAgentBuildingSkillCommand(
    {} as WorkspaceIteratorService,
    {
      findWorkspaceTwentyStandardAndCustomApplicationOrThrow: jest
        .fn()
        .mockResolvedValue({
          twentyStandardFlatApplication: {
            id: STANDARD_APPLICATION_ID,
            universalIdentifier: 'twenty-standard-universal-identifier',
          },
        }),
    } as unknown as ApplicationService,
    {
      getOrRecompute: jest.fn().mockResolvedValue({
        flatSkillMaps: {
          byUniversalIdentifier: Object.fromEntries(
            existingSkills.map((skill) => [skill.universalIdentifier, skill]),
          ),
        },
      }),
    } as unknown as WorkspaceCacheService,
    {
      validateBuildAndRunLegacyWorkspaceMigration,
    } as unknown as WorkspaceMigrationValidateBuildAndRunService,
  );

  return { command, validateBuildAndRunLegacyWorkspaceMigration };
};

const buildArgs = (dryRun = false) =>
  ({
    workspaceId: WORKSPACE_ID,
    options: { dryRun },
  }) as Parameters<AddAgentBuildingSkillCommand['up']>[0];

describe('AddAgentBuildingSkillCommand', () => {
  it('adds the agent-building skill to a workspace that does not have it', async () => {
    const { command, validateBuildAndRunLegacyWorkspaceMigration } = setup([]);

    await command.up(buildArgs());

    expect(validateBuildAndRunLegacyWorkspaceMigration).toHaveBeenCalledTimes(
      1,
    );

    const { skill } =
      validateBuildAndRunLegacyWorkspaceMigration.mock.calls[0][0]
        .allFlatEntityOperationByMetadataName;

    expect(skill.flatEntityToDelete).toEqual([]);
    expect(skill.flatEntityToUpdate).toEqual([]);
    expect(skill.flatEntityToCreate).toHaveLength(1);
    expect(skill.flatEntityToCreate[0]).toMatchObject({
      universalIdentifier: AGENT_BUILDING_SKILL_UNIVERSAL_IDENTIFIER,
      name: 'agent-building',
      applicationId: STANDARD_APPLICATION_ID,
      workspaceId: WORKSPACE_ID,
      isSystem: true,
      isActive: true,
    });
  });

  it('leaves a workspace that already has the skill unchanged', async () => {
    const { command, validateBuildAndRunLegacyWorkspaceMigration } = setup([
      buildExistingSkill({
        universalIdentifier: AGENT_BUILDING_SKILL_UNIVERSAL_IDENTIFIER,
        name: 'agent-building',
      }),
    ]);

    await command.up(buildArgs());

    expect(validateBuildAndRunLegacyWorkspaceMigration).not.toHaveBeenCalled();
  });

  it('keeps a custom skill the workspace already named agent-building', async () => {
    const { command, validateBuildAndRunLegacyWorkspaceMigration } = setup([
      buildExistingSkill({
        universalIdentifier: '20202020-0000-0000-0000-0000000000c3',
        name: 'agent-building',
      }),
    ]);

    await command.up(buildArgs());

    expect(validateBuildAndRunLegacyWorkspaceMigration).not.toHaveBeenCalled();
  });

  it('changes nothing on a dry run', async () => {
    const { command, validateBuildAndRunLegacyWorkspaceMigration } = setup([]);

    await command.up(buildArgs(true));

    expect(validateBuildAndRunLegacyWorkspaceMigration).not.toHaveBeenCalled();
  });

  it('removes the skill on down', async () => {
    const agentBuildingSkill = buildExistingSkill({
      universalIdentifier: AGENT_BUILDING_SKILL_UNIVERSAL_IDENTIFIER,
      name: 'agent-building',
    });
    const { command, validateBuildAndRunLegacyWorkspaceMigration } = setup([
      agentBuildingSkill,
    ]);

    await command.down(buildArgs());

    expect(validateBuildAndRunLegacyWorkspaceMigration).toHaveBeenCalledTimes(
      1,
    );
    expect(
      validateBuildAndRunLegacyWorkspaceMigration.mock.calls[0][0]
        .allFlatEntityOperationByMetadataName.skill,
    ).toEqual({
      flatEntityToCreate: [],
      flatEntityToDelete: [agentBuildingSkill],
      flatEntityToUpdate: [],
    });
  });
});
