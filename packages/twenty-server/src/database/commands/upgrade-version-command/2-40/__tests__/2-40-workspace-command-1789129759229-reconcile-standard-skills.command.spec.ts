import { isDefined } from 'twenty-shared/utils';

import { type WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { ReconcileStandardSkillsCommand } from 'src/database/commands/upgrade-version-command/2-40/2-40-workspace-command-1789129759229-reconcile-standard-skills.command';
import { type ApplicationService } from 'src/engine/core-modules/application/application.service';
import { type WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { computeTwentyStandardApplicationAllFlatEntityMaps } from 'src/engine/workspace-manager/twenty-standard-application/utils/twenty-standard-application-all-flat-entity-maps.constant';
import { type WorkspaceMigrationValidateBuildAndRunService } from 'src/engine/workspace-manager/workspace-migration/services/workspace-migration-validate-build-and-run-service';

const WORKSPACE_ID = '20202020-0000-0000-0000-000000000001';
const STANDARD_APPLICATION_ID = '20202020-0000-0000-0000-0000000000a1';
const OTHER_APPLICATION_ID = '20202020-0000-0000-0000-0000000000b2';

const buildExistingSkill = ({
  universalIdentifier,
  applicationId = STANDARD_APPLICATION_ID,
  isSystem = false,
  isActive = true,
  content = 'content',
}: {
  universalIdentifier: string;
  applicationId?: string;
  isSystem?: boolean;
  isActive?: boolean;
  content?: string;
}) => ({
  id: `id-${universalIdentifier}`,
  universalIdentifier,
  applicationId,
  workspaceId: WORKSPACE_ID,
  name: `name-${universalIdentifier}`,
  label: `label-${universalIdentifier}`,
  description: 'description',
  icon: 'IconBook',
  content,
  isCustom: false,
  isSystem,
  isActive,
});

const setup = ({
  existingSkills,
}: {
  existingSkills: ReturnType<typeof buildExistingSkill>[];
}) => {
  const validateBuildAndRunLegacyWorkspaceMigration = jest
    .fn()
    .mockResolvedValue({ status: 'success' });

  const command = new ReconcileStandardSkillsCommand(
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

  return { command, validateBuildAndRunLegacyWorkspaceMigration };
};

const runAndGetSkillOperation = async (
  existingSkills: ReturnType<typeof buildExistingSkill>[],
) => {
  const { command, validateBuildAndRunLegacyWorkspaceMigration } = setup({
    existingSkills,
  });

  await command.runOnWorkspace({
    workspaceId: WORKSPACE_ID,
    options: {},
  } as Parameters<typeof command.runOnWorkspace>[0]);

  if (validateBuildAndRunLegacyWorkspaceMigration.mock.calls.length === 0) {
    return undefined;
  }

  return validateBuildAndRunLegacyWorkspaceMigration.mock.calls[0][0]
    .allFlatEntityOperationByMetadataName.skill;
};

const buildStandardFlatSkills = () =>
  Object.values(
    computeTwentyStandardApplicationAllFlatEntityMaps({
      now: new Date().toISOString(),
      workspaceId: WORKSPACE_ID,
      twentyStandardApplicationId: STANDARD_APPLICATION_ID,
    }).allFlatEntityMaps.flatSkillMaps.byUniversalIdentifier,
  ).filter(isDefined);

// The catalog these tests reconcile against is the real one, so they stay
// honest when skills are added to or removed from it.
const RETIRED_SKILL_UNIVERSAL_IDENTIFIER =
  '20202020-6b44-417e-a31f-5560b59d300a';
const VIEW_BUILDING_UNIVERSAL_IDENTIFIER =
  '20202020-e4a2-4b3f-9c71-d8f6a2b51e3a';

describe('ReconcileStandardSkillsCommand', () => {
  it('creates the standard skills the workspace does not have yet', async () => {
    const skillOperation = await runAndGetSkillOperation([]);

    expect(
      skillOperation?.flatEntityToCreate.map(
        (skill: { name: string }) => skill.name,
      ),
    ).toEqual(
      expect.arrayContaining([
        'enrich',
        'meeting-prep',
        'deal-review',
        'crm-hygiene',
      ]),
    );
  });

  it('deletes a standard skill that left the catalog', async () => {
    const skillOperation = await runAndGetSkillOperation([
      buildExistingSkill({
        universalIdentifier: RETIRED_SKILL_UNIVERSAL_IDENTIFIER,
      }),
    ]);

    expect(
      skillOperation?.flatEntityToDelete.map(
        (skill: { universalIdentifier: string }) => skill.universalIdentifier,
      ),
    ).toEqual([RETIRED_SKILL_UNIVERSAL_IDENTIFIER]);
  });

  it('leaves skills owned by another application alone', async () => {
    const skillOperation = await runAndGetSkillOperation([
      buildExistingSkill({
        universalIdentifier: RETIRED_SKILL_UNIVERSAL_IDENTIFIER,
        applicationId: OTHER_APPLICATION_ID,
      }),
    ]);

    expect(skillOperation?.flatEntityToDelete).toEqual([]);
  });

  it('flips isSystem on an existing skill without reactivating it', async () => {
    const skillOperation = await runAndGetSkillOperation([
      buildExistingSkill({
        universalIdentifier: VIEW_BUILDING_UNIVERSAL_IDENTIFIER,
        isSystem: false,
        isActive: false,
      }),
    ]);

    const updatedSkill = skillOperation?.flatEntityToUpdate.find(
      (skill: { universalIdentifier: string }) =>
        skill.universalIdentifier === VIEW_BUILDING_UNIVERSAL_IDENTIFIER,
    );

    expect(updatedSkill?.isSystem).toBe(true);
    expect(updatedSkill?.isActive).toBe(false);
    expect(updatedSkill?.id).toBe(
      `id-${VIEW_BUILDING_UNIVERSAL_IDENTIFIER}`,
    );
  });

  it('queues no migration when the workspace already matches the catalog', async () => {
    const alreadyMatchingSkills = buildStandardFlatSkills().map((skill) => ({
      ...skill,
      applicationId: STANDARD_APPLICATION_ID,
    }));

    const { command, validateBuildAndRunLegacyWorkspaceMigration } = setup({
      existingSkills:
        alreadyMatchingSkills as unknown as ReturnType<
          typeof buildExistingSkill
        >[],
    });

    await command.runOnWorkspace({
      workspaceId: WORKSPACE_ID,
      options: {},
    } as Parameters<typeof command.runOnWorkspace>[0]);

    expect(validateBuildAndRunLegacyWorkspaceMigration).not.toHaveBeenCalled();
  });

  it('skips the migration entirely in dry run', async () => {
    const { command, validateBuildAndRunLegacyWorkspaceMigration } = setup({
      existingSkills: [],
    });

    await command.runOnWorkspace({
      workspaceId: WORKSPACE_ID,
      options: { dryRun: true },
    } as Parameters<typeof command.runOnWorkspace>[0]);

    expect(validateBuildAndRunLegacyWorkspaceMigration).not.toHaveBeenCalled();
  });
});
