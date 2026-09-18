import { type FrontComponentManifest } from 'twenty-shared/application';
import { isDefined } from 'twenty-shared/utils';

export const validateSettingsFrontComponentTabs = ({
  frontComponents,
}: {
  frontComponents: FrontComponentManifest[];
}): string[] => {
  const settingsFrontComponents = frontComponents.filter(({ settingsTab }) =>
    isDefined(settingsTab),
  );

  // A lone settings component can fall back to the default tab, but siblings
  // sharing that fallback would render as identically labelled tabs stacked on
  // the same position.
  if (settingsFrontComponents.length <= 1) {
    return [];
  }

  return settingsFrontComponents
    .filter(({ settingsTab }) => Object.keys(settingsTab ?? {}).length === 0)
    .map(
      ({ name, sourceComponentPath }) =>
        `Settings front component "${name ?? sourceComponentPath}" must declare a tab when the application declares several settings front components`,
    );
};
