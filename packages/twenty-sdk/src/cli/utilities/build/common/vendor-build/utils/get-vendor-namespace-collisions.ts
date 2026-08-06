import { toVendorNamespaceIdentifier } from '@/cli/utilities/build/common/vendor-build/utils/to-vendor-namespace-identifier';

export const getVendorNamespaceCollisions = (
  dependencies: string[],
): string[][] => {
  const specifiersByNamespaceIdentifier = new Map<string, string[]>();

  for (const specifier of dependencies) {
    const namespaceIdentifier = toVendorNamespaceIdentifier(specifier);
    const specifiers =
      specifiersByNamespaceIdentifier.get(namespaceIdentifier) ?? [];

    specifiers.push(specifier);
    specifiersByNamespaceIdentifier.set(namespaceIdentifier, specifiers);
  }

  return [...specifiersByNamespaceIdentifier.values()].filter(
    (specifiers) => specifiers.length > 1,
  );
};
