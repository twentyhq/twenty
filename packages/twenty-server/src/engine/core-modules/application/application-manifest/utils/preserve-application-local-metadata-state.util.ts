import { WORKSPACE_LOCAL_STATE_PROPERTIES } from 'src/engine/metadata-modules/overrides/constants/workspace-local-state-properties.constant';

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

  for (const property of WORKSPACE_LOCAL_STATE_PROPERTIES) {
    if (property in existingEntityRecord && property in mergedEntityRecord) {
      mergedEntityRecord[property] = existingEntityRecord[property];
    }
  }

  return mergedEntityRecord as TEntity;
};
