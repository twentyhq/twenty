const WIDGET_CONFIGURATION_FIELD_METADATA_ID_KEYS = [
  'aggregateFieldMetadataId',
  'primaryAxisGroupByFieldMetadataId',
  'secondaryAxisGroupByFieldMetadataId',
  'groupByFieldMetadataId',
  'fieldMetadataId',
  'nestedRelationFieldMetadataId',
];

export const remapWidgetConfiguration = (
  configuration: Record<string, unknown>,
  targetFieldIdBySourceFieldId: Map<string, string>,
  targetViewIdBySourceViewId: Map<string, string>,
): Record<string, unknown> => {
  const remapped = { ...configuration };
  for (const key of WIDGET_CONFIGURATION_FIELD_METADATA_ID_KEYS) {
    const sourceFieldId = remapped[key];
    if (typeof sourceFieldId === 'string') {
      remapped[key] = targetFieldIdBySourceFieldId.get(sourceFieldId) ?? null;
    }
  }
  // An INDEX view is not recreated in the target, so its id differs there - a copied-through
  // viewId would point at nothing.
  const sourceViewId = remapped.viewId;
  if (typeof sourceViewId === 'string') {
    remapped.viewId = targetViewIdBySourceViewId.get(sourceViewId) ?? null;
  }
  return remapped;
};