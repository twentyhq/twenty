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
): Record<string, unknown> => {
  const remapped = { ...configuration };
  for (const key of WIDGET_CONFIGURATION_FIELD_METADATA_ID_KEYS) {
    const sourceFieldId = remapped[key];
    if (typeof sourceFieldId === 'string') {
      remapped[key] = targetFieldIdBySourceFieldId.get(sourceFieldId) ?? null;
    }
  }
  return remapped;
};