// manifests published before 2.53 can still declare APPLICATION readability or writability
export const isLegacyApplicationMetadataAccess = (
  access: string | undefined,
): boolean => access === 'APPLICATION';
