import { defineField, FieldType, RelationType, OnDeleteAction } from 'twenty-sdk/define';
import { EXECUTIVE_PROFILE_UNIVERSAL_IDENTIFIER } from '../objects/executive-profile.object';
import { EXECUTIVE_LANGUAGE_UNIVERSAL_IDENTIFIER } from '../objects/executive-language.object';
import { EXECUTIVE_LANGUAGE_EP_REVERSE_RELATION_UNIVERSAL_IDENTIFIER } from '../objects/executive-language.object';

export default defineField({
  universalIdentifier:
    EXECUTIVE_LANGUAGE_EP_REVERSE_RELATION_UNIVERSAL_IDENTIFIER,
  objectUniversalIdentifier: EXECUTIVE_PROFILE_UNIVERSAL_IDENTIFIER,
  type: FieldType.RELATION,
  name: 'executiveLanguages',
  label: 'Languages',
  relationTargetObjectMetadataUniversalIdentifier:
    EXECUTIVE_LANGUAGE_UNIVERSAL_IDENTIFIER,
  relationTargetFieldMetadataUniversalIdentifier:
    '69d7bf86-1a96-4e09-9095-83e3ec93846b', // EXECUTIVE_LANGUAGE_EP_RELATION_UNIVERSAL_IDENTIFIER
  universalSettings: {
    relationType: RelationType.ONE_TO_MANY,
    onDelete: OnDeleteAction.CASCADE,
  },
});
