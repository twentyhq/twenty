import {
  defineField,
  FieldType,
  STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS,
} from 'twenty-sdk/define';

export const DESIRED_AREA_FIELD_UNIVERSAL_IDENTIFIER =
  '073ed8cf-7e08-4325-bd3a-c033155a4a4d';

export default defineField({
  universalIdentifier: DESIRED_AREA_FIELD_UNIVERSAL_IDENTIFIER,
  objectUniversalIdentifier:
    STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.person.universalIdentifier,
  type: FieldType.TEXT,
  name: 'desiredArea',
  label: 'Desired area',
  description: 'Neighborhood or area the buyer is looking in',
  icon: 'IconMapSearch',
});
