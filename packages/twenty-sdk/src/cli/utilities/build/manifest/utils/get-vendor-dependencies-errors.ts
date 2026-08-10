import { isNonEmptyArray } from '@sniptt/guards';

import { REACT_VENDOR_SPECIFIERS } from '@/cli/utilities/build/common/vendor-build/constants/react-vendor-specifiers.constant';

export const getVendorDependenciesErrors = (
  dependencies: string[],
): string[] => {
  const vendoredReactDomDependencies = dependencies.filter(
    (dependency) =>
      dependency === REACT_VENDOR_SPECIFIERS.reactDom ||
      dependency.startsWith(`${REACT_VENDOR_SPECIFIERS.reactDom}/`),
  );

  if (
    isNonEmptyArray(vendoredReactDomDependencies) &&
    !dependencies.includes(REACT_VENDOR_SPECIFIERS.react)
  ) {
    return [
      `Vendor declares ${vendoredReactDomDependencies.join(', ')} without "react". Add "react" to defineVendor dependencies so both share the same react instance.`,
    ];
  }

  return [];
};
