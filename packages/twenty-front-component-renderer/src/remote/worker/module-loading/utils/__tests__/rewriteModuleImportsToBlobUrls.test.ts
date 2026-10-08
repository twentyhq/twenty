import { FRONT_COMPONENT_SHARED_DEPENDENCIES_IMPORT_SPECIFIER } from 'twenty-shared/application';

import { rewriteModuleImportsToBlobUrls } from '../rewriteModuleImportsToBlobUrls';

const blobUrlBySpecifier = {
  [FRONT_COMPONENT_SHARED_DEPENDENCIES_IMPORT_SPECIFIER]:
    'blob:shared-dependencies-url',
  'twenty-client-sdk/core': 'blob:core-url',
  'twenty-client-sdk/metadata': 'blob:metadata-url',
};

describe('rewriteModuleImportsToBlobUrls', () => {
  it('should rewrite every specifier of the map to its blob url', () => {
    const source = `import { __shared_dependencies_react__ } from "${FRONT_COMPONENT_SHARED_DEPENDENCIES_IMPORT_SPECIFIER}";\nimport { CoreApiClient } from 'twenty-client-sdk/core';\nimport { MetadataApiClient } from "twenty-client-sdk/metadata";`;

    expect(rewriteModuleImportsToBlobUrls(source, blobUrlBySpecifier)).toBe(
      'import { __shared_dependencies_react__ } from "blob:shared-dependencies-url";\nimport { CoreApiClient } from \'blob:core-url\';\nimport { MetadataApiClient } from "blob:metadata-url";',
    );
  });

  it('should rewrite minified imports without whitespace', () => {
    const source = `import{__shared_dependencies_react__}from"${FRONT_COMPONENT_SHARED_DEPENDENCIES_IMPORT_SPECIFIER}";`;

    expect(rewriteModuleImportsToBlobUrls(source, blobUrlBySpecifier)).toBe(
      'import{__shared_dependencies_react__}from"blob:shared-dependencies-url";',
    );
  });

  it('should rewrite export from statements', () => {
    const source = 'export { CoreApiClient } from "twenty-client-sdk/core";';

    expect(rewriteModuleImportsToBlobUrls(source, blobUrlBySpecifier)).toBe(
      'export { CoreApiClient } from "blob:core-url";',
    );
  });

  it('should rewrite a deferred import of the shared dependencies bundle', () => {
    const source = `const sharedDependencies = await import('${FRONT_COMPONENT_SHARED_DEPENDENCIES_IMPORT_SPECIFIER}');`;

    expect(rewriteModuleImportsToBlobUrls(source, blobUrlBySpecifier)).toBe(
      "const sharedDependencies = await import('blob:shared-dependencies-url');",
    );
  });

  it('should rewrite a side effect only import of the shared dependencies bundle', () => {
    const source = `import "${FRONT_COMPONENT_SHARED_DEPENDENCIES_IMPORT_SPECIFIER}";`;

    expect(rewriteModuleImportsToBlobUrls(source, blobUrlBySpecifier)).toBe(
      'import "blob:shared-dependencies-url";',
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
    const source = `const specifier = "${FRONT_COMPONENT_SHARED_DEPENDENCIES_IMPORT_SPECIFIER}";`;

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
