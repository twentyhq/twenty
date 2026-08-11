import { toSharedDependenciesNamespaceIdentifier } from '@/cli/utilities/build/common/shared-dependencies-build/utils/to-shared-dependencies-namespace-identifier';

export const getSharedDependenciesNamespaceCollisions = (
  dependencies: string[],
): string[][] => {
  const specifiersByNamespaceIdentifier = new Map<string, string[]>();

  for (const specifier of dependencies) {
    const namespaceIdentifier =
      toSharedDependenciesNamespaceIdentifier(specifier);
    const specifiers =
      specifiersByNamespaceIdentifier.get(namespaceIdentifier) ?? [];

    specifiers.push(specifier);
    specifiersByNamespaceIdentifier.set(namespaceIdentifier, specifiers);
  }

  return [...specifiersByNamespaceIdentifier.values()].filter(
    (specifiers) => specifiers.length > 1,
  );
};
