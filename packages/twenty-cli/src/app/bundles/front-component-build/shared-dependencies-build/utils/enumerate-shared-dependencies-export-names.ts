import { enumerateSharedDependenciesExportNames as enumerateExports } from 'twenty-shared/front-component-build';

import { getWatchInputPlugins } from '@/app/dev/collect-watch-inputs';
import { getBaseFrontComponentBuildOptions } from '@/app/bundles/front-component-build/utils/get-base-front-component-build-options';

export const enumerateSharedDependenciesExportNames = async ({
  appPath,
  specifier,
}: {
  appPath: string;
  specifier: string;
}) => {
  const options = getBaseFrontComponentBuildOptions();

  try {
    return await enumerateExports({
      appPath,
      specifier,
      buildOptions: {
        ...options,
        plugins: [...getWatchInputPlugins(), ...(options.plugins ?? [])],
      },
    });
  } catch (cause) {
    throw new Error(
      `Unable to determine the exports of shared dependency "${specifier}". Check that it is installed and importable from the application.`,
      { cause },
    );
  }
};
