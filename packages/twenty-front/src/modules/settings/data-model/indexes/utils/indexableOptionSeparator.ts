// The Select component takes string values. We encode (fieldMetadataId,
// subFieldName) as `${id}` for scalar fields and `${id}::${subFieldName}` for
// composite sub-fields. Stable, easy to parse, no collisions because UUIDs
// don't contain `::`.
export const INDEXABLE_OPTION_SEPARATOR = '::';
