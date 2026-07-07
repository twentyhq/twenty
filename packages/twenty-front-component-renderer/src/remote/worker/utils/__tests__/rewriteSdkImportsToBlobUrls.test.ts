import { rewriteSdkImportsToBlobUrls } from '../rewriteSdkImportsToBlobUrls';

const sdkModuleBlobUrls = {
  core: 'blob:core-url',
  metadata: 'blob:metadata-url',
};

describe('rewriteSdkImportsToBlobUrls', () => {
  it('should rewrite double quoted core and metadata specifiers to blob urls', () => {
    const source =
      'import { CoreApiClient } from "twenty-client-sdk/core";\nimport { MetadataApiClient } from "twenty-client-sdk/metadata";';

    expect(rewriteSdkImportsToBlobUrls(source, sdkModuleBlobUrls)).toBe(
      'import { CoreApiClient } from "blob:core-url";\nimport { MetadataApiClient } from "blob:metadata-url";',
    );
  });

  it('should rewrite single quoted specifiers', () => {
    const source = "import { CoreApiClient } from 'twenty-client-sdk/core';";

    expect(rewriteSdkImportsToBlobUrls(source, sdkModuleBlobUrls)).toBe(
      "import { CoreApiClient } from 'blob:core-url';",
    );
  });

  it('should rewrite every occurrence when a specifier appears multiple times', () => {
    const source =
      'import "twenty-client-sdk/core";\nconst lazy = () => import("twenty-client-sdk/core");';

    expect(rewriteSdkImportsToBlobUrls(source, sdkModuleBlobUrls)).toBe(
      'import "blob:core-url";\nconst lazy = () => import("blob:core-url");',
    );
  });

  it('should leave sources without sdk specifiers unchanged', () => {
    const source = 'export const answer = 42;';

    expect(rewriteSdkImportsToBlobUrls(source, sdkModuleBlobUrls)).toBe(source);
  });

  it('should not rewrite specifiers that are a prefix of a longer specifier', () => {
    const source = 'import "twenty-client-sdk/core-utils";';

    expect(rewriteSdkImportsToBlobUrls(source, sdkModuleBlobUrls)).toBe(source);
  });

  it('should not rewrite the specifier without surrounding quotes', () => {
    const source = 'const specifier = `twenty-client-sdk/core`;';

    expect(rewriteSdkImportsToBlobUrls(source, sdkModuleBlobUrls)).toBe(source);
  });

  it('should not rewrite the specifier inside a plain string literal', () => {
    const source = 'const specifierName = "twenty-client-sdk/core";';

    expect(rewriteSdkImportsToBlobUrls(source, sdkModuleBlobUrls)).toBe(source);
  });

  it('should rewrite export from statements', () => {
    const source = 'export { CoreApiClient } from "twenty-client-sdk/core";';

    expect(rewriteSdkImportsToBlobUrls(source, sdkModuleBlobUrls)).toBe(
      'export { CoreApiClient } from "blob:core-url";',
    );
  });

  it('should rewrite minified imports without whitespace', () => {
    const source = 'import{CoreApiClient}from"twenty-client-sdk/core";';

    expect(rewriteSdkImportsToBlobUrls(source, sdkModuleBlobUrls)).toBe(
      'import{CoreApiClient}from"blob:core-url";',
    );
  });
});
