import { REACT_VENDOR_SPECIFIERS } from '@/cli/utilities/build/common/vendor-build/constants/react-vendor-specifiers.constant';

export const normalizeVendorDependencies = (
  dependencies: string[],
): string[] => {
  const normalizedDependencies = new Set(dependencies);

  if (normalizedDependencies.has(REACT_VENDOR_SPECIFIERS.react)) {
    normalizedDependencies.add(REACT_VENDOR_SPECIFIERS.reactJsxRuntime);
  }

  return [...normalizedDependencies].sort();
};
