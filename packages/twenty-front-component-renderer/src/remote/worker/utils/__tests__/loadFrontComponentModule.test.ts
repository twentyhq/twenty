import { SHARED_DEPENDENCIES_IMPORT_SPECIFIER } from 'twenty-shared/application';

import { loadFrontComponentModule } from '../loadFrontComponentModule';

describe('loadFrontComponentModule', () => {
  it('should fail closed when the component needs a shared dependencies bundle that was not provided', async () => {
    await expect(
      loadFrontComponentModule({
        componentSource: `import { __shared_dependencies_react__ } from "${SHARED_DEPENDENCIES_IMPORT_SPECIFIER}";\nexport default () => {};`,
      }),
    ).rejects.toMatchObject({
      code: 'FRONT_COMPONENT_SHARED_DEPENDENCIES_MISSING',
    });
  });
});
