export const toVendorNamespaceIdentifier = (specifier: string): string =>
  `__vendor_${specifier.replace(/[^A-Za-z0-9]/g, '_')}__`;
