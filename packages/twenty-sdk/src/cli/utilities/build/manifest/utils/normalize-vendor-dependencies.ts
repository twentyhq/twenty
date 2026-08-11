export const normalizeVendorDependencies = (
  dependencies: string[],
): string[] => {
  const normalizedDependencies = new Set(dependencies);

  if (normalizedDependencies.has('react')) {
    normalizedDependencies.add('react/jsx-runtime');
  }

  return [...normalizedDependencies].sort();
};
