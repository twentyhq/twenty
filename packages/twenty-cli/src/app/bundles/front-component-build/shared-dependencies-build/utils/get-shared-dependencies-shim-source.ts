import {
  type SharedDependenciesExportNames,
  toSharedDependenciesNamespaceIdentifier,
} from 'twenty-shared/front-component-build';

import { FRONT_COMPONENT_SHARED_DEPENDENCIES_IMPORT_SPECIFIER } from 'twenty-shared/application';

export const getSharedDependenciesShimSource = ({
  specifier,
  exportNames,
}: {
  specifier: string;
  exportNames: SharedDependenciesExportNames;
}): string => {
  const namespaceIdentifier =
    toSharedDependenciesNamespaceIdentifier(specifier);
  const names = [
    ...exportNames.namedExports,
    ...(exportNames.hasDefaultExport ? ['default'] : []),
  ];

  if (names.length === 0) {
    return `import ${JSON.stringify(FRONT_COMPONENT_SHARED_DEPENDENCIES_IMPORT_SPECIFIER)};`;
  }

  return names
    .map(
      (name, index) =>
        `export { ${namespaceIdentifier}_${index} as ${JSON.stringify(name)} } from ${JSON.stringify(FRONT_COMPONENT_SHARED_DEPENDENCIES_IMPORT_SPECIFIER)};`,
    )
    .join('\n');
};
