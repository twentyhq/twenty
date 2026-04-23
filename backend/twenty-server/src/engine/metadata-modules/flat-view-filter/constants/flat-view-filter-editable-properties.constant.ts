import { type MetadataEntityPropertyName } from 'src/engine/metadata-modules/flat-entity/constant/all-entity-properties-configuration-by-metadata-name.constant';

export const FLAT_VIEW_FILTER_EDITABLE_PROPERTIES = [
  'fieldMetadataId',
  'operand',
  'value',
  'viewFilterGroupId',
  'positionInViewFilterGroup',
  'subFieldName',
] as const satisfies MetadataEntityPropertyName<'viewFilter'>[];
