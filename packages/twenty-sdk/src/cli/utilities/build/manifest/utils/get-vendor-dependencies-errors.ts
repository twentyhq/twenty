// React DOM resolves the hook dispatcher from the react copy it was bundled
// with, so vendoring it without react leaves components rendering against a
// second react copy and every hook throws at runtime.
export const getVendorDependenciesErrors = (
  dependencies: string[],
): string[] => {
  const vendoredReactDomDependencies = dependencies.filter(
    (dependency) =>
      dependency === 'react-dom' || dependency.startsWith('react-dom/'),
  );

  if (
    vendoredReactDomDependencies.length > 0 &&
    !dependencies.includes('react')
  ) {
    return [
      `Vendor declares ${vendoredReactDomDependencies.join(', ')} without "react". Add "react" to defineVendor dependencies so both share the same react instance.`,
    ];
  }

  return [];
};
