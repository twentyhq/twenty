import { VENDOR_BUNDLE_IMPORT_SPECIFIER } from 'twenty-shared/application';

import { rewriteModuleImportsToBlobUrls } from '../rewriteModuleImportsToBlobUrls';

const blobUrlBySpecifier = {
  [VENDOR_BUNDLE_IMPORT_SPECIFIER]: 'blob:vendor-url',
  'twenty-client-sdk/core': 'blob:core-url',
  'twenty-client-sdk/metadata': 'blob:metadata-url',
};

describe('rewriteModuleImportsToBlobUrls', () => {
  it('should rewrite every specifier of the map to its blob url', () => {
    const source = `import { __vendor_react__ } from "${VENDOR_BUNDLE_IMPORT_SPECIFIER}";\nimport { CoreApiClient } from 'twenty-client-sdk/core';\nimport { MetadataApiClient } from "twenty-client-sdk/metadata";`;

    expect(rewriteModuleImportsToBlobUrls(source, blobUrlBySpecifier)).toBe(
      'import { __vendor_react__ } from "blob:vendor-url";\nimport { CoreApiClient } from \'blob:core-url\';\nimport { MetadataApiClient } from "blob:metadata-url";',
    );
  });

  it('should rewrite minified imports without whitespace', () => {
    const source = `import{__vendor_react__}from"${VENDOR_BUNDLE_IMPORT_SPECIFIER}";`;

    expect(rewriteModuleImportsToBlobUrls(source, blobUrlBySpecifier)).toBe(
      'import{__vendor_react__}from"blob:vendor-url";',
    );
  });

  it('should rewrite export from statements', () => {
    const source = 'export { CoreApiClient } from "twenty-client-sdk/core";';

    expect(rewriteModuleImportsToBlobUrls(source, blobUrlBySpecifier)).toBe(
      'export { CoreApiClient } from "blob:core-url";',
    );
  });

  it('should rewrite a deferred import of the vendor bundle', () => {
    const source = `const vendor = await import('${VENDOR_BUNDLE_IMPORT_SPECIFIER}');`;

    expect(rewriteModuleImportsToBlobUrls(source, blobUrlBySpecifier)).toBe(
      "const vendor = await import('blob:vendor-url');",
    );
  });

  it('should rewrite a side effect only import of the vendor bundle', () => {
    const source = `import "${VENDOR_BUNDLE_IMPORT_SPECIFIER}";`;

    expect(rewriteModuleImportsToBlobUrls(source, blobUrlBySpecifier)).toBe(
      'import "blob:vendor-url";',
    );
  });

  it('should rewrite every occurrence when a specifier appears multiple times', () => {
    const source =
      'import "twenty-client-sdk/core";\nconst lazy = () => import("twenty-client-sdk/core");';

    expect(rewriteModuleImportsToBlobUrls(source, blobUrlBySpecifier)).toBe(
      'import "blob:core-url";\nconst lazy = () => import("blob:core-url");',
    );
  });

  it('should leave a source without any mapped specifier unchanged', () => {
    const source = 'export const answer = 42;';

    expect(rewriteModuleImportsToBlobUrls(source, blobUrlBySpecifier)).toBe(
      source,
    );
  });

  it('should not rewrite a specifier that is a prefix of a longer specifier', () => {
    const source = 'import "twenty-client-sdk/core-utils";';

    expect(rewriteModuleImportsToBlobUrls(source, blobUrlBySpecifier)).toBe(
      source,
    );
  });

  it('should not rewrite a specifier that only appears as a string literal', () => {
    const source = `const specifier = "${VENDOR_BUNDLE_IMPORT_SPECIFIER}";`;

    expect(rewriteModuleImportsToBlobUrls(source, blobUrlBySpecifier)).toBe(
      source,
    );
  });

  it('should not rewrite a specifier inside a template literal', () => {
    const source = 'const specifier = `twenty-client-sdk/core`;';

    expect(rewriteModuleImportsToBlobUrls(source, blobUrlBySpecifier)).toBe(
      source,
    );
  });
});
