import { TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER } from 'twenty-shared/application';

import { buildSkillContentReplacement } from 'src/database/commands/upgrade-version-command/2-54/utils/build-skill-content-replacement.util';
import { type FlatSkill } from 'src/engine/metadata-modules/flat-skill/types/flat-skill.type';

const PREVIOUS_CONTENT = '# CRM Hygiene Skill\n\nThere is no merge tool.';
const NEXT_CONTENT = '# CRM Hygiene Skill\n\nMerge with merge_many_*.';

const buildSkill = (content: string): FlatSkill => ({
  id: 'skill-id',
  universalIdentifier: '20202020-9a63-4d82-b5e7-6f1c8d3a4e20',
  name: 'crm-hygiene',
  label: 'CRM Hygiene',
  icon: 'IconListCheck',
  description: null,
  content,
  isSystem: false,
  isActive: false,
  overrides: null,
  workspaceId: '20202020-1111-4111-8111-111111111111',
  applicationId: '20202020-2222-4222-8222-222222222222',
  applicationUniversalIdentifier:
    TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
});

describe('buildSkillContentReplacement', () => {
  it('replaces the content of a skill the workspace never edited', () => {
    expect(
      buildSkillContentReplacement({
        skill: buildSkill(PREVIOUS_CONTENT),
        fromContent: PREVIOUS_CONTENT,
        toContent: NEXT_CONTENT,
      }),
    ).toEqual(buildSkill(NEXT_CONTENT));
  });

  it('leaves a skill whose content was edited', () => {
    expect(
      buildSkillContentReplacement({
        skill: buildSkill(`${PREVIOUS_CONTENT}\n\nOur own rule.`),
        fromContent: PREVIOUS_CONTENT,
        toContent: NEXT_CONTENT,
      }),
    ).toBeUndefined();
  });

  it('does nothing when the workspace has no such skill', () => {
    expect(
      buildSkillContentReplacement({
        skill: undefined,
        fromContent: PREVIOUS_CONTENT,
        toContent: NEXT_CONTENT,
      }),
    ).toBeUndefined();
  });
});
