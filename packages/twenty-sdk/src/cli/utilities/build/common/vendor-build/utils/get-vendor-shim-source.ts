import { type VendorExportNames } from '@/cli/utilities/build/common/vendor-build/types/vendor-export-names.type';
import { toVendorNamespaceIdentifier } from '@/cli/utilities/build/common/vendor-build/utils/to-vendor-namespace-identifier';
import { VENDOR_BUNDLE_IMPORT_SPECIFIER } from 'twenty-shared/application';

export const getVendorShimSource = ({
  specifier,
  exportNames,
}: {
  specifier: string;
  exportNames: VendorExportNames;
}): string => {
  const namespaceIdentifier = toVendorNamespaceIdentifier(specifier);

  const lines = [
    `import { ${namespaceIdentifier} } from ${JSON.stringify(VENDOR_BUNDLE_IMPORT_SPECIFIER)};`,
  ];

  exportNames.namedExports.forEach((exportName, index) => {
    lines.push(
      `const __vendorExport${index} = ${namespaceIdentifier}[${JSON.stringify(exportName)}];`,
      `export { __vendorExport${index} as ${JSON.stringify(exportName)} };`,
    );
  });

  if (exportNames.hasDefaultExport) {
    lines.push(`export default ${namespaceIdentifier}.default;`);
  }

  return lines.join('\n');
};
