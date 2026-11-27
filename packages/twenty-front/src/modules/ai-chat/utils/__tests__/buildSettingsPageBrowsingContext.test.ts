import { buildSettingsPageBrowsingContext } from '@/ai-chat/utils/buildSettingsPageBrowsingContext';

const path = '/settings/objects/companies/validation-rules/new';
const draft = {
  kind: 'validationRule' as const,
  expression: 'amount > 0',
  path,
};

describe('buildSettingsPageBrowsingContext', () => {
  it('should leave the draft out when the flag is off', () => {
    expect(
      buildSettingsPageBrowsingContext({ path, draft, isDraftEnabled: false }),
    ).toEqual({ type: 'settingsPage', path });
  });

  it('should include the draft typed on the current page', () => {
    expect(
      buildSettingsPageBrowsingContext({ path, draft, isDraftEnabled: true }),
    ).toEqual({
      type: 'settingsPage',
      path,
      draft: { kind: 'validationRule', expression: 'amount > 0' },
    });
  });

  it('should leave out a missing draft or one typed on another page', () => {
    expect(
      buildSettingsPageBrowsingContext({
        path,
        draft: null,
        isDraftEnabled: true,
      }),
    ).toEqual({ type: 'settingsPage', path });
    expect(
      buildSettingsPageBrowsingContext({
        path: '/settings/objects/companies',
        draft,
        isDraftEnabled: true,
      }),
    ).toEqual({ type: 'settingsPage', path: '/settings/objects/companies' });
  });
});
