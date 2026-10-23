import { TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER } from 'twenty-shared/application';
import { isDefined } from 'twenty-shared/utils';

import { type WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { ReconcileStandardSkillCatalogCommand } from 'src/database/commands/upgrade-version-command/2-52/2-52-workspace-command-1792764632845-reconcile-standard-skill-catalog.command';
import { type ApplicationService } from 'src/engine/core-modules/application/application.service';
import { type WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { computeTwentyStandardApplicationAllFlatEntityMaps } from 'src/engine/workspace-manager/twenty-standard-application/utils/twenty-standard-application-all-flat-entity-maps.constant';
import { type WorkspaceMigrationValidateBuildAndRunService } from 'src/engine/workspace-manager/workspace-migration/services/workspace-migration-validate-build-and-run-service';

const WORKSPACE_ID = '20202020-0000-0000-0000-000000000001';
const STANDARD_APPLICATION_ID = '20202020-0000-0000-0000-0000000000a1';
const OTHER_APPLICATION_ID = '20202020-0000-0000-0000-0000000000b2';

// The catalog these tests reconcile against is the real one, so they stay honest when it changes
const RETIRED_SKILL_UNIVERSAL_IDENTIFIER =
  '20202020-6b44-417e-a31f-5560b59d300a';
const METADATA_BUILDING_UNIVERSAL_IDENTIFIER =
  '20202020-7b80-4a14-8fb9-d1512b89c078';

type ExistingSkill = {
  id: string;
  universalIdentifier: string;
  applicationId: string;
  workspaceId: string;
  name: string;
  label: string;
  description: string;
  icon: string;
  content: string;
  isCustom: boolean;
  isSystem: boolean;
  isActive: boolean;
};

const buildExistingSkill = ({
  universalIdentifier,
  applicationId = STANDARD_APPLICATION_ID,
  isSystem = false,
  isActive = true,
  content = 'content',
  name,
}: {
  universalIdentifier: string;
  applicationId?: string;
  isSystem?: boolean;
  isActive?: boolean;
  content?: string;
  name?: string;
}): ExistingSkill => ({
  id: `id-${universalIdentifier}`,
  universalIdentifier,
  applicationId,
  workspaceId: WORKSPACE_ID,
  name: name ?? `name-${universalIdentifier}`,
  label: `label-${universalIdentifier}`,
  description: 'description',
  icon: 'IconBook',
  content,
  isCustom: false,
  isSystem,
  isActive,
});

const buildStandardFlatSkills = () =>
  Object.values(
    computeTwentyStandardApplicationAllFlatEntityMaps({
      now: new Date().toISOString(),
      workspaceId: WORKSPACE_ID,
      twentyStandardApplicationId: STANDARD_APPLICATION_ID,
    }).allFlatEntityMaps.flatSkillMaps.byUniversalIdentifier,
  ).filter(isDefined);

const runCommand = async ({
  existingSkills,
  dryRun = false,
}: {
  existingSkills: ExistingSkill[];
  dryRun?: boolean;
}) => {
  const validateBuildAndRunLegacyWorkspaceMigration = jest
    .fn()
    .mockResolvedValue({ status: 'success' });

  const command = new ReconcileStandardSkillCatalogCommand(
    {} as WorkspaceIteratorService,
    {
      findWorkspaceTwentyStandardAndCustomApplicationOrThrow: jest
        .fn()
        .mockResolvedValue({
          twentyStandardFlatApplication: {
            id: STANDARD_APPLICATION_ID,
            universalIdentifier: TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER,
          },
        }),
    } as unknown as ApplicationService,
    {
      validateBuildAndRunLegacyWorkspaceMigration,
    } as unknown as WorkspaceMigrationValidateBuildAndRunService,
    {
      getOrRecompute: jest.fn().mockResolvedValue({
        flatSkillMaps: {
          byUniversalIdentifier: Object.fromEntries(
            existingSkills.map((skill) => [skill.universalIdentifier, skill]),
          ),
        },
      }),
    } as unknown as WorkspaceCacheService,
  );

  await command.runOnWorkspace({
    workspaceId: WORKSPACE_ID,
    options: { dryRun },
  } as Parameters<typeof command.runOnWorkspace>[0]);

  const [migrationArgs] =
    validateBuildAndRunLegacyWorkspaceMigration.mock.calls[0] ?? [];

  return {
    validateBuildAndRunLegacyWorkspaceMigration,
    migrationArgs,
    skillOperation: migrationArgs?.allFlatEntityOperationByMetadataName.skill,
  };
};

describe('ReconcileStandardSkillCatalogCommand', () => {
  it('refreshes the content of a standard skill that changed, without reactivating it', async () => {
    const { skillOperation } = await runCommand({
      existingSkills: [
        buildExistingSkill({
          universalIdentifier: METADATA_BUILDING_UNIVERSAL_IDENTIFIER,
          isSystem: true,
          isActive: false,
          content: 'get_object_metadata returns an array of objects.',
        }),
      ],
    });

    const updatedSkill = skillOperation?.flatEntityToUpdate.find(
      (skill: ExistingSkill) =>
        skill.universalIdentifier === METADATA_BUILDING_UNIVERSAL_IDENTIFIER,
    );

    expect(updatedSkill).toMatchObject({
      id: `id-${METADATA_BUILDING_UNIVERSAL_IDENTIFIER}`,
      isActive: false,
    });
    expect(updatedSkill?.content).toContain('result.objects');
  });

  it('applies the migration as the twenty standard application', async () => {
    const { migrationArgs } = await runCommand({ existingSkills: [] });

    expect(migrationArgs).toMatchObject({
      workspaceId: WORKSPACE_ID,
      isSystemBuild: true,
      applicationUniversalIdentifier:
        TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER,
    });
  });

  it('creates the standard skills the workspace does not have yet', async () => {
    const { skillOperation } = await runCommand({ existingSkills: [] });

    expect(
      skillOperation?.flatEntityToCreate.map(
        (skill: ExistingSkill) => skill.name,
      ),
    ).toEqual(
      expect.arrayContaining(['metadata-building', 'enrich', 'meeting-prep']),
    );
  });

  it('deletes a standard skill that left the catalog', async () => {
    const { skillOperation } = await runCommand({
      existingSkills: [
        buildExistingSkill({
          universalIdentifier: RETIRED_SKILL_UNIVERSAL_IDENTIFIER,
        }),
      ],
    });

    expect(
      skillOperation?.flatEntityToDelete.map(
        (skill: ExistingSkill) => skill.universalIdentifier,
      ),
    ).toEqual([RETIRED_SKILL_UNIVERSAL_IDENTIFIER]);
  });

  it('leaves skills owned by another application alone', async () => {
    const { skillOperation } = await runCommand({
      existingSkills: [
        buildExistingSkill({
          universalIdentifier: RETIRED_SKILL_UNIVERSAL_IDENTIFIER,
          applicationId: OTHER_APPLICATION_ID,
        }),
      ],
    });

    expect(skillOperation?.flatEntityToDelete).toEqual([]);
  });

  it('skips a create whose name another skill already took', async () => {
    const { skillOperation } = await runCommand({
      existingSkills: [
        buildExistingSkill({
          universalIdentifier: '20202020-0000-0000-0000-00000000c0de',
          applicationId: OTHER_APPLICATION_ID,
          name: 'enrich',
        }),
      ],
    });

    const createdNames = skillOperation?.flatEntityToCreate.map(
      (skill: ExistingSkill) => skill.name,
    );

    expect(createdNames).not.toContain('enrich');
    expect(createdNames).toContain('meeting-prep');
  });

  it('still creates a standard skill whose name is only held by a skill being deleted', async () => {
    const { skillOperation } = await runCommand({
      existingSkills: [
        buildExistingSkill({
          universalIdentifier: RETIRED_SKILL_UNIVERSAL_IDENTIFIER,
          name: 'enrich',
        }),
      ],
    });

    expect(
      skillOperation?.flatEntityToCreate.map(
        (skill: ExistingSkill) => skill.name,
      ),
    ).toContain('enrich');
  });

  it('queues no migration when the workspace already matches the catalog', async () => {
    const { validateBuildAndRunLegacyWorkspaceMigration } = await runCommand({
      existingSkills: buildStandardFlatSkills() as unknown as ExistingSkill[],
    });

    expect(validateBuildAndRunLegacyWorkspaceMigration).not.toHaveBeenCalled();
  });

  it('queues no migration in dry run', async () => {
    const { validateBuildAndRunLegacyWorkspaceMigration } = await runCommand({
      existingSkills: [],
      dryRun: true,
    });

    expect(validateBuildAndRunLegacyWorkspaceMigration).not.toHaveBeenCalled();
  });
});
