export const getExpectedObjectViewsHash = ({
  objectViewsHashes,
  objectMetadataId,
}: {
  objectViewsHashes: Record<string, string> | undefined;
  objectMetadataId: string;
}): string => objectViewsHashes?.[objectMetadataId] ?? '';
