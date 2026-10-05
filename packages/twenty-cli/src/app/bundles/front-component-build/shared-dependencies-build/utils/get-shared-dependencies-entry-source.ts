import { toSharedDependenciesNamespaceIdentifier } from '@/app/bundles/front-component-build/shared-dependencies-build/utils/to-shared-dependencies-namespace-identifier';

export const getSharedDependenciesEntrySource = (
  dependencies: string[],
): string =>
  dependencies
    .map((specifier) => {
      const namespaceIdentifier =
        toSharedDependenciesNamespaceIdentifier(specifier);

      return `import * as ${namespaceIdentifier} from ${JSON.stringify(specifier)};\nexport { ${namespaceIdentifier} };`;
    })
    .join('\n');
