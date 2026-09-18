import {
  type FrontComponentManifest,
  takesDefaultFrontComponentSettingsTab,
} from 'twenty-shared/application';
import { isDefined } from 'twenty-shared/utils';

export const validateSettingsFrontComponentTabs = ({
  frontComponents,
}: {
  frontComponents: FrontComponentManifest[];
}): string[] => {
  const settingsFrontComponents = frontComponents.filter(({ settingsTab }) =>
    isDefined(settingsTab),
  );

  if (settingsFrontComponents.length <= 1) {
    return [];
  }

  return settingsFrontComponents
    .filter(({ settingsTab }) => takesDefaultFrontComponentSettingsTab(settingsTab))
    .map(
      ({ name, sourceComponentPath }) =>
        `Settings front component "${name ?? sourceComponentPath}" must declare a tab when the application declares several settings front components`,
    );
};
