import { getSkillBaseFile } from '@/cli/utilities/entity/entity-skill-template';

describe('getSkillBaseFile', () => {
  it('should render proper file using defineSkill', () => {
    const result = getSkillBaseFile({
      name: 'my-skill',
      universalIdentifier: '71e45a58-41da-4ae4-8b73-a543c0a9d3d4',
    });

    expect(result).toContain("import { defineSkill } from 'twenty-sdk'");
    expect(result).toContain('export default defineSkill({');
    expect(result).toContain(
      'universalIdentifier: MY_SKILL_SKILL_UNIVERSAL_IDENTIFIER',
    );
    expect(result).toContain("'71e45a58-41da-4ae4-8b73-a543c0a9d3d4'");
    expect(result).toContain("name: 'my-skill'");
    expect(result).toContain("label: 'my-skill'");
    expect(result).toContain("description: 'Add a description for your skill'");
    expect(result).toContain("content: 'Add the skill content here'");
  });

  it('should generate unique UUID when not provided', () => {
    const result = getSkillBaseFile({
      name: 'auto-uuid-skill',
    });

    expect(result).toMatch(
      /'[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}'/,
    );
  });

  it('should export universal identifier constant with correct naming', () => {
    const result = getSkillBaseFile({
      name: 'data-export',
    });

    expect(result).toContain(
      'export const DATA_EXPORT_SKILL_UNIVERSAL_IDENTIFIER',
    );
    expect(result).toContain(
      'universalIdentifier: DATA_EXPORT_SKILL_UNIVERSAL_IDENTIFIER',
    );
  });

  it('should use kebab-case for name in template', () => {
    const result = getSkillBaseFile({
      name: 'my-awesome-skill',
    });

    expect(result).toContain("name: 'my-awesome-skill'");
    expect(result).toContain("label: 'my-awesome-skill'");
  });

  it('should handle names with numbers', () => {
    const result = getSkillBaseFile({
      name: 'skill-v2',
    });

    expect(result).toContain(
      'export const SKILL_V_2_SKILL_UNIVERSAL_IDENTIFIER',
    );
    expect(result).toContain("label: 'skill-v2'");
  });
});
