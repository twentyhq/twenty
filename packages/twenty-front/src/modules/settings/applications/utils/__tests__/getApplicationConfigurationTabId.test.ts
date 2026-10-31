import { APPLICATION_VARIABLES_TAB_ID } from '@/settings/applications/constants/ApplicationVariablesTabId';
import { getApplicationConfigurationTabId } from '@/settings/applications/utils/getApplicationConfigurationTabId';

describe('getApplicationConfigurationTabId', () => {
  it('should point to the variables tab when there is one', () => {
    expect(
      getApplicationConfigurationTabId({
        hasVariablesTab: true,
        settingsMenuItems: [],
      }),
    ).toBe(APPLICATION_VARIABLES_TAB_ID);
  });

  it('should point to the first settings item otherwise', () => {
    expect(
      getApplicationConfigurationTabId({
        hasVariablesTab: false,
        settingsMenuItems: [
          { universalIdentifier: 'first-settings' },
          { universalIdentifier: 'second-settings' },
        ],
      }),
    ).toBe('first-settings');
  });

  it('should point to the first settings item slug when it has one', () => {
    expect(
      getApplicationConfigurationTabId({
        hasVariablesTab: false,
        settingsMenuItems: [
          { universalIdentifier: 'first-settings', slug: 'sync' },
          { universalIdentifier: 'second-settings', slug: null },
        ],
      }),
    ).toBe('sync');
  });

  it('should have no configuration tab without variables or settings items', () => {
    expect(
      getApplicationConfigurationTabId({
        hasVariablesTab: false,
        settingsMenuItems: [],
      }),
    ).toBeUndefined();
  });
});
