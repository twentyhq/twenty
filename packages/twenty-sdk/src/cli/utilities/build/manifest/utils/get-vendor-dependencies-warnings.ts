import { REACT_VENDOR_SPECIFIERS } from '@/cli/utilities/build/common/vendor-build/constants/react-vendor-specifiers.constant';

export const getVendorDependenciesWarnings = (
  dependencies: string[],
): string[] => {
  if (
    dependencies.includes(REACT_VENDOR_SPECIFIERS.react) &&
    !dependencies.includes(REACT_VENDOR_SPECIFIERS.reactDomClient)
  ) {
    return [
      'Vendor declares "react" but not "react-dom/client": every front component still bundles its own copy of react-dom. Add "react-dom/client" to defineVendor dependencies.',
    ];
  }

  return [];
};
