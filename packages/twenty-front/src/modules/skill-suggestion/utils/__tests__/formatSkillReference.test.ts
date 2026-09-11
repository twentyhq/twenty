import { formatSkillReference } from '@/skill-suggestion/utils/formatSkillReference';

describe('formatSkillReference', () => {
  it('should prefix a single-token name with a slash', () => {
    expect(formatSkillReference('workflow-building')).toBe(
      '/workflow-building',
    );
  });

  it('should quote a name containing whitespace', () => {
    expect(formatSkillReference('customer research')).toBe(
      '/"customer research"',
    );
  });
});
