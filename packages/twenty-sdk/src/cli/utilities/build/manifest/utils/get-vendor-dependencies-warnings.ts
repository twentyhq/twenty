export const getVendorDependenciesWarnings = (
  dependencies: string[],
): string[] => {
  if (
    dependencies.includes('react') &&
    !dependencies.includes('react-dom/client')
  ) {
    return [
      'Vendor declares "react" but not "react-dom/client": every front component still bundles its own copy of react-dom. Add "react-dom/client" to defineVendor dependencies.',
    ];
  }

  return [];
};
