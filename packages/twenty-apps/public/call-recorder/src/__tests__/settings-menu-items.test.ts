import { describe, expect, it } from 'vitest';

import { CALL_RECORDER_SETTINGS_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER } from 'src/constants/call-recorder-settings-front-component-universal-identifier';
import { CALL_RECORDER_USER_SETTINGS_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import settingsFrontComponent from 'src/front-components/settings.front-component';
import userSettingsFrontComponent from 'src/front-components/user-settings.front-component';
import settingsMenuItem from 'src/settings-menu-items/call-recorder-settings';
import userSettingsMenuItem from 'src/settings-menu-items/call-recorder-user-settings';

describe('settings menu items', () => {
  it('pass the SDK manifest validation', () => {
    for (const entity of [
      settingsMenuItem,
      userSettingsMenuItem,
      settingsFrontComponent,
      userSettingsFrontComponent,
    ]) {
      expect(entity.errors).toEqual([]);
    }
  });

  it('keeps the workspace settings tab on the existing settings component', () => {
    expect(settingsMenuItem.config).toMatchObject({
      scope: 'WORKSPACE',
      frontComponentUniversalIdentifier:
        CALL_RECORDER_SETTINGS_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER,
    });
  });

  it('exposes the member preferences on a user-scoped tab', () => {
    expect(userSettingsMenuItem.config).toMatchObject({
      scope: 'USER',
      frontComponentUniversalIdentifier:
        CALL_RECORDER_USER_SETTINGS_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER,
    });
    expect(userSettingsFrontComponent.config.universalIdentifier).toBe(
      CALL_RECORDER_USER_SETTINGS_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER,
    );
  });
});
