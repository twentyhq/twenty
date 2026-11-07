import { type SkillManifest } from 'twenty-shared/application';

import { fromSkillManifestToUniversalFlatSkill } from 'src/engine/core-modules/application/application-manifest/converters/from-skill-manifest-to-universal-flat-skill.util';
import { addAllFlatEntitiesToFlatEntityMaps } from 'src/engine/core-modules/application/application-manifest/utils/__tests__/add-all-flat-entities-to-flat-entity-maps.test-util';
import { reconstructSkillsManifest } from 'src/engine/core-modules/application/application-manifest/utils/reconstruct-skills-manifest.util';
import { ApplicationExportCoverageStatus } from 'src/engine/core-modules/application/enums/application-export-coverage-status.enum';
import { createEmptyAllFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/constant/create-empty-all-flat-entity-maps.constant';
import { type FlatSkill } from 'src/engine/metadata-modules/flat-skill/types/flat-skill.type';

const APP_UNIVERSAL_IDENTIFIER = '10000000-0000-4000-8000-000000000001';
const NOW = '2026-09-14T10:00:00.000Z';
const OUTREACH_SKILL_UNIVERSAL_IDENTIFIER =
  '20000000-0000-4000-8000-000000000001';
const DEACTIVATED_SKILL_UNIVERSAL_IDENTIFIER =
  '20000000-0000-4000-8000-000000000002';
const SYSTEM_SKILL_UNIVERSAL_IDENTIFIER =
  '20000000-0000-4000-8000-000000000003';
const OVERRIDDEN_SKILL_UNIVERSAL_IDENTIFIER =
  '20000000-0000-4000-8000-000000000004';
const WORKSPACE_CUSTOM_APPLICATION_UNIVERSAL_IDENTIFIER =
  '10000000-0000-4000-8000-000000000002';

const buildSkillManifest = (universalIdentifier: string): SkillManifest => ({
  universalIdentifier,
  name: `skill-${universalIdentifier.slice(-1)}`,
  label: 'Skill',
  content: 'Follow the outreach playbook.',
});

const buildFlatSkill = (
  universalIdentifier: string,
  overrides: Partial<FlatSkill> = {},
): FlatSkill => ({
  ...fromSkillManifestToUniversalFlatSkill({
    skillManifest: buildSkillManifest(universalIdentifier),
    applicationUniversalIdentifier: APP_UNIVERSAL_IDENTIFIER,
    now: NOW,
  }),
  id: `${universalIdentifier}-id`,
  workspaceId: 'workspace-id',
  applicationId: 'application-id',
  ...overrides,
});

const { skills, coverage } = reconstructSkillsManifest({
  applicationAllFlatEntityMaps: {
    flatSkillMaps: addAllFlatEntitiesToFlatEntityMaps({
      flatEntities: [
        buildFlatSkill(OUTREACH_SKILL_UNIVERSAL_IDENTIFIER),
        buildFlatSkill(DEACTIVATED_SKILL_UNIVERSAL_IDENTIFIER, {
          isActive: false,
        }),
        buildFlatSkill(SYSTEM_SKILL_UNIVERSAL_IDENTIFIER, { isSystem: true }),
        buildFlatSkill(OVERRIDDEN_SKILL_UNIVERSAL_IDENTIFIER, {
          overrides: {
            [WORKSPACE_CUSTOM_APPLICATION_UNIVERSAL_IDENTIFIER]: {
              label: 'Workspace label',
              isActive: false,
            },
          },
        }),
      ],
      flatEntityMaps: createEmptyAllFlatEntityMaps().flatSkillMaps,
    }),
  },
});

describe('reconstructSkillsManifest', () => {
  it('should export an active application skill', () => {
    expect(skills).toContainEqual(
      buildSkillManifest(OUTREACH_SKILL_UNIVERSAL_IDENTIFIER),
    );
    expect(coverage).toContainEqual({
      metadataName: 'skill',
      universalIdentifier: OUTREACH_SKILL_UNIVERSAL_IDENTIFIER,
      status: ApplicationExportCoverageStatus.EXPORTED,
    });
  });

  it.each([
    [
      DEACTIVATED_SKILL_UNIVERSAL_IDENTIFIER,
      'deactivated in this workspace, exported active',
    ],
    [
      OVERRIDDEN_SKILL_UNIVERSAL_IDENTIFIER,
      'deactivated in this workspace, exported active, workspace overrides not exported',
    ],
  ])(
    'should export skill %s with its workspace state noted: %s',
    (universalIdentifier, reason) => {
      expect(skills).toContainEqual(buildSkillManifest(universalIdentifier));
      expect(coverage).toContainEqual({
        metadataName: 'skill',
        universalIdentifier,
        status: ApplicationExportCoverageStatus.EXPORTED,
        reason,
      });
    },
  );

  it('should report a system skill as unsupported', () => {
    expect(coverage).toContainEqual({
      metadataName: 'skill',
      universalIdentifier: SYSTEM_SKILL_UNIVERSAL_IDENTIFIER,
      status: ApplicationExportCoverageStatus.UNSUPPORTED,
      reason: 'skill with values a definition cannot express: isSystem',
    });
  });
});
