import { type SkillManifest } from 'twenty-shared/application';

import { type UniversalFlatSkill } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-skill.type';

export const fromSkillManifestToUniversalFlatSkill = ({
  skillManifest,
  applicationUniversalIdentifier,
  now,
}: {
  skillManifest: SkillManifest;
  applicationUniversalIdentifier: string;
  now: string;
}): UniversalFlatSkill => {
  return {
    universalIdentifier: skillManifest.universalIdentifier,
    applicationUniversalIdentifier,
    name: skillManifest.name,
    label: skillManifest.label,
    icon: skillManifest.icon ?? null,
    description: skillManifest.description ?? null,
    content: skillManifest.content,
    isCustom: false,
    // An app ships skills for the people using it, so they stay in the picker;
    // the manifest has no way to opt out yet.
    isSystem: false,
    isActive: true,
    createdAt: now,
    updatedAt: now,
  };
};
