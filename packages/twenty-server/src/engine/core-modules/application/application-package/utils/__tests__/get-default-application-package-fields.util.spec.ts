import { STANDARD_APPLICATION_DEPENDENCIES_DIRECTORY_NAME } from 'src/engine/core-modules/application/application-package/constants/standard-application-dependencies-directory-name';
import { getDefaultApplicationPackageFieldsForApplication } from 'src/engine/core-modules/application/application-package/utils/get-default-application-package-fields-for-application.util';
import { TWENTY_PREVIOUS_VERSIONS } from 'src/engine/core-modules/upgrade/constants/twenty-previous-versions.constant';

import { getDefaultApplicationPackageFields } from 'src/engine/core-modules/application/application-package/utils/get-default-application-package-fields.util';
import { WORKSPACE_CUSTOM_APPLICATION_DEPENDENCIES_DIRECTORY_NAME } from 'src/engine/core-modules/application/application-package/constants/workspace-custom-application-dependencies-directory-name';

describe('application dependency defaults', () => {
  it('keeps frontend packages in the Workspace custom app only', async () => {
    const standard = await getDefaultApplicationPackageFields();
    const custom = await getDefaultApplicationPackageFields({
      directory: WORKSPACE_CUSTOM_APPLICATION_DEPENDENCIES_DIRECTORY_NAME,
    });
    expect(standard.packageJsonChecksum).toBe(
      '7a6f26a21a5a95e71afea95f73d91f97',
    );
    expect(standard.yarnLockChecksum).toBe('73cdf4b9d674e4be327ad36550d758e6');
    const standardPackage = JSON.parse(standard.packageJsonContent);
    const customPackage = JSON.parse(custom.packageJsonContent);
    expect(standardPackage.devDependencies).toBeUndefined();
    expect(customPackage.dependencies).toEqual(standardPackage.dependencies);
    expect(customPackage.devDependencies).toEqual({
      react: '19.2.0',
      'react-dom': '19.2.0',
      'twenty-ui': `~${TWENTY_PREVIOUS_VERSIONS[TWENTY_PREVIOUS_VERSIONS.length - 2]}`,
    });
    expect(customPackage.frontComponentSharedDependencies).toEqual(
      expect.arrayContaining([
        'react',
        'react-dom',
        'react-dom/client',
        'twenty-ui/primitives/input',
      ]),
    );
  });
});

describe('application default dependency selection', () => {
  it.each<[string, string | null | undefined, string]>([
    [
      'workspace-custom',
      'workspace-custom',
      WORKSPACE_CUSTOM_APPLICATION_DEPENDENCIES_DIRECTORY_NAME,
    ],
    [
      'standard',
      'workspace-custom',
      STANDARD_APPLICATION_DEPENDENCIES_DIRECTORY_NAME,
    ],
    [
      'installed',
      'workspace-custom',
      STANDARD_APPLICATION_DEPENDENCIES_DIRECTORY_NAME,
    ],
    ['installed', null, STANDARD_APPLICATION_DEPENDENCIES_DIRECTORY_NAME],
    ['installed', undefined, STANDARD_APPLICATION_DEPENDENCIES_DIRECTORY_NAME],
  ])(
    'loads %s defaults when the Workspace app is %s',
    async (applicationId, workspaceCustomApplicationId, directory) => {
      const fields = await getDefaultApplicationPackageFieldsForApplication({
        applicationId,
        workspaceCustomApplicationId,
      });

      expect(fields).toEqual(
        await getDefaultApplicationPackageFields({ directory }),
      );
    },
  );
});
