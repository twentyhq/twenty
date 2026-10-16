export const toSharedDependenciesNamespaceIdentifier = (
  specifier: string,
): string =>
  `__shared_dependencies_${specifier.replace(/[^A-Za-z0-9]/g, '_')}__`;
