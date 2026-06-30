import { readFile } from 'node:fs/promises';
import { join } from 'path';

import {
  FUNCTION_EXECUTE_APP_PATH,
  MINIMAL_APP_PATH,
} from '@/cli/__tests__/apps/fixture-paths';
import { buildManifest } from '@/cli/utilities/build/manifest/manifest-build';

describe('buildManifest aboutDescription from README', () => {
  it('populates application.aboutDescription from the app README when not set in config', async () => {
    const { manifest, errors } = await buildManifest(FUNCTION_EXECUTE_APP_PATH);

    expect(errors).toEqual([]);

    const readme = await readFile(
      join(FUNCTION_EXECUTE_APP_PATH, 'README.md'),
      'utf-8',
    );

    expect(manifest?.application.aboutDescription).toBe(readme);
  }, 60000);

  it('leaves application.aboutDescription undefined when the app has no README', async () => {
    const { manifest, errors } = await buildManifest(MINIMAL_APP_PATH);

    expect(errors).toEqual([]);
    expect(manifest?.application.aboutDescription).toBeUndefined();
  }, 60000);
});
