import { defineField, FieldType, RelationType, OnDeleteAction } from 'twenty-sdk/define';
import { EXECUTIVE_PROFILE_UNIVERSAL_IDENTIFIER } from '../objects/executive-profile.object';
import { EXECUTIVE_EXTERNAL_PROFILE_UNIVERSAL_IDENTIFIER } from '../objects/executive-external-profile.object';
import { EXECUTIVE_EXTERNAL_PROFILE_EP_REVERSE_RELATION_UNIVERSAL_IDENTIFIER } from '../objects/executive-external-profile.object';

export default defineField({
  universalIdentifier:
    EXECUTIVE_EXTERNAL_PROFILE_EP_REVERSE_RELATION_UNIVERSAL_IDENTIFIER,
  objectUniversalIdentifier: EXECUTIVE_PROFILE_UNIVERSAL_IDENTIFIER,
  type: FieldType.RELATION,
  name: 'executiveExternalProfiles',
  label: 'External Profiles',
  relationTargetObjectMetadataUniversalIdentifier:
    EXECUTIVE_EXTERNAL_PROFILE_UNIVERSAL_IDENTIFIER,
  relationTargetFieldMetadataUniversalIdentifier:
    'ee27b5b0-cc32-4358-b28f-7afc53d7cd86', // EXECUTIVE_EXTERNAL_PROFILE_EP_RELATION_UNIVERSAL_IDENTIFIER
  universalSettings: {
    relationType: RelationType.ONE_TO_MANY,
    onDelete: OnDeleteAction.CASCADE,
  },
});
