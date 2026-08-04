import { VENDOR_BUNDLE_IMPORT_SPECIFIER } from 'twenty-shared/application';

import { containsVendorImportSpecifier } from '../containsVendorImportSpecifier';

describe('containsVendorImportSpecifier', () => {
  it('should detect a static import of the vendor bundle', () => {
    expect(
      containsVendorImportSpecifier(
        `import { __vendor_react__ } from "${VENDOR_BUNDLE_IMPORT_SPECIFIER}";`,
      ),
    ).toBe(true);
  });

  it('should detect a dynamic import of the vendor bundle', () => {
    expect(
      containsVendorImportSpecifier(
        `const vendor = await import('${VENDOR_BUNDLE_IMPORT_SPECIFIER}');`,
      ),
    ).toBe(true);
  });

  it('should not detect the specifier outside of an import context', () => {
    expect(
      containsVendorImportSpecifier(
        `const specifier = "${VENDOR_BUNDLE_IMPORT_SPECIFIER}";`,
      ),
    ).toBe(false);
  });

  it('should not detect anything in a component that bundles its dependencies', () => {
    expect(containsVendorImportSpecifier('export default () => null;')).toBe(
      false,
    );
  });
});
