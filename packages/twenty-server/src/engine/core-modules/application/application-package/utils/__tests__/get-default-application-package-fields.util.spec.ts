import { SEED_DEPENDENCIES_DIRNAME } from 'src/engine/core-modules/application/application-package/constants/seed-dependencies-dirname';
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
      '8514f570e81570c63ca197e03b61df56',
    );
    expect(standard.yarnLockChecksum).toBe('b0937b6de2a7af91a1aded812c50d371');
    const standardPackage = JSON.parse(standard.packageJsonContent);
    const customPackage = JSON.parse(custom.packageJsonContent);
    expect(standardPackage.devDependencies).toBeUndefined();
    expect(customPackage.dependencies).toEqual(standardPackage.dependencies);
    expect(customPackage.devDependencies).toEqual({
      react: '19.2.0',
      'react-dom': '19.2.0',
      'twenty-ui': `~${TWENTY_PREVIOUS_VERSIONS[TWENTY_PREVIOUS_VERSIONS.length - 1]}`,
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
    ['standard', 'workspace-custom', SEED_DEPENDENCIES_DIRNAME],
    ['installed', 'workspace-custom', SEED_DEPENDENCIES_DIRNAME],
    ['installed', null, SEED_DEPENDENCIES_DIRNAME],
    ['installed', undefined, SEED_DEPENDENCIES_DIRNAME],
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
