import { hasApplicationVariablesTab } from '@/settings/applications/utils/hasApplicationVariablesTab';

describe('hasApplicationVariablesTab', () => {
  it('should show the variables tab when there is no settings item', () => {
    expect(
      hasApplicationVariablesTab({
        settingsMenuItems: [],
        displayedApplicationVariables: [{ key: 'API_KEY' }],
      }),
    ).toBe(true);
  });

  it('should leave the variables to the settings items when there are some', () => {
    expect(
      hasApplicationVariablesTab({
        settingsMenuItems: [{ universalIdentifier: 'settings' }],
        displayedApplicationVariables: [{ key: 'API_KEY' }],
      }),
    ).toBe(false);
  });

  it('should not show an empty variables tab', () => {
    expect(
      hasApplicationVariablesTab({
        settingsMenuItems: [],
        displayedApplicationVariables: [],
      }),
    ).toBe(false);
  });
});
