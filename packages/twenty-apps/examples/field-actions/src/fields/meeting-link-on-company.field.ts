import {
  defineField,
  FieldType,
  STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS,
} from 'twenty-sdk/define';

export const MEETING_LINK_FIELD_UNIVERSAL_IDENTIFIER =
  '7887bca7-3129-445c-bd3a-2ca10cf68b73';

export default defineField({
  universalIdentifier: MEETING_LINK_FIELD_UNIVERSAL_IDENTIFIER,
  objectUniversalIdentifier:
    STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.company.universalIdentifier,
  type: FieldType.LINKS,
  name: 'meetingLink',
  label: 'Meeting link',
  description: 'Video meeting link for this company',
  icon: 'IconVideo',
});
