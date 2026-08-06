import { toVendorNamespaceIdentifier } from '@/cli/utilities/build/common/vendor-build/utils/to-vendor-namespace-identifier';

export const getVendorEntrySource = (dependencies: string[]): string =>
  dependencies
    .map((specifier) => {
      const namespaceIdentifier = toVendorNamespaceIdentifier(specifier);

      return `import * as ${namespaceIdentifier} from ${JSON.stringify(specifier)};\nexport { ${namespaceIdentifier} };`;
    })
    .join('\n');
