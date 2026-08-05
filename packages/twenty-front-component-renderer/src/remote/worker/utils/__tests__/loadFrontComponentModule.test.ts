import { VENDOR_BUNDLE_IMPORT_SPECIFIER } from 'twenty-shared/application';

import { loadFrontComponentModule } from '../loadFrontComponentModule';

describe('loadFrontComponentModule', () => {
  it('should fail closed when the component needs a vendor bundle that was not provided', async () => {
    await expect(
      loadFrontComponentModule({
        componentSource: `import { __vendor_react__ } from "${VENDOR_BUNDLE_IMPORT_SPECIFIER}";\nexport default () => {};`,
      }),
    ).rejects.toMatchObject({
      code: 'FRONT_COMPONENT_VENDOR_BUNDLE_MISSING',
    });
  });
});
