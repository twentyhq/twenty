const APPLICATION_LOCAL_METADATA_PROPERTIES = [
  'overrides',
  'universalOverrides',
  'isActive',
] as const;

export const preserveApplicationLocalMetadataState = <TEntity extends object>({
  existingEntity,
  manifestEntity,
}: {
  existingEntity: TEntity;
  manifestEntity: TEntity;
}): TEntity => {
  const existingEntityRecord = existingEntity as Record<string, unknown>;
  const mergedEntityRecord = { ...manifestEntity } as Record<string, unknown>;
  const supportsOverrides = ['overrides', 'universalOverrides'].some(
    (property) =>
      property in existingEntityRecord && property in mergedEntityRecord,
  );

  if (!supportsOverrides) {
    return manifestEntity;
  }

  for (const property of APPLICATION_LOCAL_METADATA_PROPERTIES) {
    if (property in existingEntityRecord && property in mergedEntityRecord) {
      mergedEntityRecord[property] = existingEntityRecord[property];
    }
  }

  // Unlike the properties above, isSearchable is only workspace-local when
  // the manifest leaves it unspecified (converted to null): an explicit
  // boolean stays authoritative. Preserving the workspace state on null is
  // what keeps a relabel additive and what lets workspace toggles survive
  // syncs of manifests that never mention the flag.
  if (
    'isSearchable' in existingEntityRecord &&
    'isSearchable' in mergedEntityRecord &&
    mergedEntityRecord.isSearchable === null
  ) {
    mergedEntityRecord.isSearchable = existingEntityRecord.isSearchable;
  }

  return mergedEntityRecord as TEntity;
};
