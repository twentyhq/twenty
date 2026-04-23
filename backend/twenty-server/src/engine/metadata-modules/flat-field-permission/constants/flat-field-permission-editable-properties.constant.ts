import { type MetadataEntityPropertyName } from 'src/engine/metadata-modules/flat-entity/constant/all-entity-properties-configuration-by-metadata-name.constant';

export const FLAT_FIELD_PERMISSION_EDITABLE_PROPERTIES = [
  'roleId',
  'objectMetadataId',
  'fieldMetadataId',
  'canReadFieldValue',
  'canUpdateFieldValue',
] as const satisfies MetadataEntityPropertyName<'fieldPermission'>[];
