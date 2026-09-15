import { join } from 'path';

import { MINIMAL_APP_PATH } from '@/cli/__tests__/apps/fixture-paths';
import { extractManifestFromFile } from '@/cli/utilities/build/manifest/manifest-extract-config-from-file';
import { type FrontComponentConfig } from '@/sdk/define/front-component/front-component-config';

describe('extractManifestFromFile - front component importing twenty-ui', () => {
  it('extracts the config from a front component that side-effect imports twenty-ui/style.css', async () => {
    const filePath = join(MINIMAL_APP_PATH, 'my.front-component.tsx');

    const result = await extractManifestFromFile<FrontComponentConfig>({
      appPath: MINIMAL_APP_PATH,
      filePath,
    });

    expect(result.errors).toEqual([]);
    expect(result.config.universalIdentifier).toBe(
      'e1e2e3e4-e5e6-4000-8000-000000000020',
    );
    expect(result.config.name).toBe('my-component');
  }, 30000);
});
