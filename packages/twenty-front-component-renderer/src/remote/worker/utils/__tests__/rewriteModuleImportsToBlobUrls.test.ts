import { VENDOR_BUNDLE_IMPORT_SPECIFIER } from 'twenty-shared/application';

import { rewriteModuleImportsToBlobUrls } from '../rewriteModuleImportsToBlobUrls';

describe('rewriteModuleImportsToBlobUrls', () => {
  it('should rewrite every specifier of the map to its blob url', () => {
    const source = `import { __vendor_react__ } from "${VENDOR_BUNDLE_IMPORT_SPECIFIER}";\nimport { CoreApiClient } from 'twenty-client-sdk/core';`;

    expect(
      rewriteModuleImportsToBlobUrls(source, {
        [VENDOR_BUNDLE_IMPORT_SPECIFIER]: 'blob:vendor-url',
        'twenty-client-sdk/core': 'blob:core-url',
      }),
    ).toBe(
      'import { __vendor_react__ } from "blob:vendor-url";\nimport { CoreApiClient } from \'blob:core-url\';',
    );
  });

  it('should leave a source without any mapped specifier unchanged', () => {
    const source = 'export const answer = 42;';

    expect(
      rewriteModuleImportsToBlobUrls(source, {
        [VENDOR_BUNDLE_IMPORT_SPECIFIER]: 'blob:vendor-url',
      }),
    ).toBe(source);
  });

  it('should not rewrite a specifier that only appears as a string literal', () => {
    const source = `const specifier = "${VENDOR_BUNDLE_IMPORT_SPECIFIER}";`;

    expect(
      rewriteModuleImportsToBlobUrls(source, {
        [VENDOR_BUNDLE_IMPORT_SPECIFIER]: 'blob:vendor-url',
      }),
    ).toBe(source);
  });
});
