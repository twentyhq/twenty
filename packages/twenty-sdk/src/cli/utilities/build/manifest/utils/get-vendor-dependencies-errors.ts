import { isNonEmptyArray } from '@sniptt/guards';

export const getVendorDependenciesErrors = (
  dependencies: string[],
): string[] => {
  const vendoredReactDomDependencies = dependencies.filter(
    (dependency) =>
      dependency === 'react-dom' || dependency.startsWith('react-dom/'),
  );

  if (
    isNonEmptyArray(vendoredReactDomDependencies) &&
    !dependencies.includes('react')
  ) {
    return [
      `Vendor declares ${vendoredReactDomDependencies.join(', ')} without "react". Add "react" to defineVendor dependencies so both share the same react instance.`,
    ];
  }

  return [];
};
