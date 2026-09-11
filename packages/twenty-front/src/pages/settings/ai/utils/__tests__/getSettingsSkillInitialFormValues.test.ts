import { getSettingsSkillInitialFormValues } from '~/pages/settings/ai/utils/getSettingsSkillInitialFormValues';

const skill = {
  __typename: 'Skill' as const,
  id: 'skill-id',
  name: 'leadResearch',
  label: 'Lead research',
  description: 'Finds context on a lead',
  icon: 'IconSearch',
  content: 'Search the web for the company.',
  isCustom: true,
  isSystem: false,
  isActive: true,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
};

describe('getSettingsSkillInitialFormValues', () => {
  it('starts a new skill with an empty form and the label synced to the name', () => {
    expect(getSettingsSkillInitialFormValues()).toEqual({
      name: '',
      label: '',
      description: '',
      content: '',
      icon: 'IconBook',
      isLabelSyncedWithName: true,
    });
  });

  it('maps a loaded skill and keeps the sync on when the name derives from the label', () => {
    expect(getSettingsSkillInitialFormValues(skill)).toEqual({
      name: 'leadResearch',
      label: 'Lead research',
      description: 'Finds context on a lead',
      content: 'Search the web for the company.',
      icon: 'IconSearch',
      isLabelSyncedWithName: true,
    });
  });

  it('turns the sync off for a custom name and falls back to the default icon and empty description', () => {
    const formValues = getSettingsSkillInitialFormValues({
      ...skill,
      name: 'customApiName',
      description: null,
      icon: null,
    });

    expect(formValues.isLabelSyncedWithName).toBe(false);
    expect(formValues.description).toBe('');
    expect(formValues.icon).toBe('IconBook');
  });
});
