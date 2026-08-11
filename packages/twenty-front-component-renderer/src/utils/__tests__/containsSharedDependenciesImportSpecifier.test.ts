import { SHARED_DEPENDENCIES_IMPORT_SPECIFIER } from 'twenty-shared/application';

import { containsSharedDependenciesImportSpecifier } from '../containsSharedDependenciesImportSpecifier';

describe('containsSharedDependenciesImportSpecifier', () => {
  it('should detect a static import of the shared dependencies bundle', () => {
    expect(
      containsSharedDependenciesImportSpecifier(
        `import { __shared_dependencies_react__ } from "${SHARED_DEPENDENCIES_IMPORT_SPECIFIER}";`,
      ),
    ).toBe(true);
  });

  it('should detect a dynamic import of the shared dependencies bundle', () => {
    expect(
      containsSharedDependenciesImportSpecifier(
        `const sharedDependencies = await import('${SHARED_DEPENDENCIES_IMPORT_SPECIFIER}');`,
      ),
    ).toBe(true);
  });

  it('should not detect the specifier outside of an import context', () => {
    expect(
      containsSharedDependenciesImportSpecifier(
        `const specifier = "${SHARED_DEPENDENCIES_IMPORT_SPECIFIER}";`,
      ),
    ).toBe(false);
  });

  it('should not detect anything in a component that bundles its dependencies', () => {
    expect(
      containsSharedDependenciesImportSpecifier('export default () => null;'),
    ).toBe(false);
  });
});
