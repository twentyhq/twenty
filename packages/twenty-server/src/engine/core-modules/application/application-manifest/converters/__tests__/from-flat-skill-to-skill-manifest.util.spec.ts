import { type SkillManifest } from 'twenty-shared/application';

import { fromFlatSkillToSkillManifest } from 'src/engine/core-modules/application/application-manifest/converters/from-flat-skill-to-skill-manifest.util';
import { fromSkillManifestToUniversalFlatSkill } from 'src/engine/core-modules/application/application-manifest/converters/from-skill-manifest-to-universal-flat-skill.util';
import { type UniversalFlatSkill } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-skill.type';
import { compareTwoFlatEntity } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/utils/compare-two-universal-flat-entity.util';

const APP_UID = '11111111-1111-4111-8111-111111111111';
const SKILL_UID = '22222222-2222-4222-8222-222222222222';
const NOW = '2026-09-14T10:00:00.000Z';

const SKILL_MANIFEST: Required<SkillManifest> = {
  universalIdentifier: SKILL_UID,
  name: 'sales-outreach',
  label: 'Sales Outreach',
  icon: 'IconBrain',
  description: 'Guides a structured outreach',
  content: 'Research the company, then draft a message.',
};

const forward = (skillManifest: SkillManifest) =>
  fromSkillManifestToUniversalFlatSkill({
    skillManifest,
    applicationUniversalIdentifier: APP_UID,
    now: NOW,
  });

describe('fromFlatSkillToSkillManifest', () => {
  it('should reproduce the manifest after a forward then an inverse conversion', () => {
    expect(
      fromFlatSkillToSkillManifest({ flatSkill: forward(SKILL_MANIFEST) }),
    ).toEqual(SKILL_MANIFEST);
  });

  it('should reproduce the flat entity after an inverse then a forward conversion', () => {
    const flatSkill: UniversalFlatSkill = {
      ...forward(SKILL_MANIFEST),
      icon: null,
      description: null,
    };

    expect(
      compareTwoFlatEntity({
        fromUniversalFlatEntity: flatSkill,
        toUniversalFlatEntity: forward(
          fromFlatSkillToSkillManifest({ flatSkill }),
        ),
        metadataName: 'skill',
      }),
    ).toBeUndefined();
  });

  it('should omit the icon and description of a skill stored without them', () => {
    const {
      icon: _icon,
      description: _description,
      ...manifestWithoutIconAndDescription
    } = SKILL_MANIFEST;

    expect(
      fromFlatSkillToSkillManifest({
        flatSkill: forward(manifestWithoutIconAndDescription),
      }),
    ).toStrictEqual(manifestWithoutIconAndDescription);
  });
});
