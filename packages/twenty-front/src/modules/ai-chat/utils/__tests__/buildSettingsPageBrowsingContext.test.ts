import { buildSettingsPageBrowsingContext } from '@/ai-chat/utils/buildSettingsPageBrowsingContext';

const path = '/settings/objects/companies/validation-rules/new';
const draft = { kind: 'validationRule' as const, expression: 'amount > 0' };

describe('buildSettingsPageBrowsingContext', () => {
  it('should leave the draft out when the flag is off', () => {
    expect(
      buildSettingsPageBrowsingContext({ path, draft, isDraftEnabled: false }),
    ).toEqual({ type: 'settingsPage', path });
  });

  it('should include the draft when the flag is on', () => {
    expect(
      buildSettingsPageBrowsingContext({ path, draft, isDraftEnabled: true }),
    ).toEqual({ type: 'settingsPage', path, draft });
  });

  it('should leave the draft out when there is none or it is blank', () => {
    expect(
      buildSettingsPageBrowsingContext({
        path,
        draft: null,
        isDraftEnabled: true,
      }),
    ).toEqual({ type: 'settingsPage', path });
    expect(
      buildSettingsPageBrowsingContext({
        path,
        draft: { ...draft, expression: '  ' },
        isDraftEnabled: true,
      }),
    ).toEqual({ type: 'settingsPage', path });
  });
});
