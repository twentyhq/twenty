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
      '19e2309740fef4df0654b2e673626344',
    );
    expect(standard.yarnLockChecksum).toBe('c17ba0399c57dedf69097e8d3de895c0');
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
