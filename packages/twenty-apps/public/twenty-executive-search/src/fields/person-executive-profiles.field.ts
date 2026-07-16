import { defineField, FieldType, RelationType, OnDeleteAction } from 'twenty-sdk/define';
import { EXECUTIVE_PROFILE_UNIVERSAL_IDENTIFIER } from '../objects/executive-profile.object';
import { EXECUTIVE_PROFILE_PERSON_REVERSE_RELATION_UNIVERSAL_IDENTIFIER } from '../objects/executive-profile.object';

// ONE_TO_MANY from person -> executiveProfiles
export default defineField({
  universalIdentifier: EXECUTIVE_PROFILE_PERSON_REVERSE_RELATION_UNIVERSAL_IDENTIFIER,
  objectUniversalIdentifier: '20202020-e674-48e5-a542-72570eee7213', // standard person
  type: FieldType.RELATION,
  name: 'executiveProfiles',
  label: 'Executive Profiles',
  relationTargetObjectMetadataUniversalIdentifier:
    EXECUTIVE_PROFILE_UNIVERSAL_IDENTIFIER,
  relationTargetFieldMetadataUniversalIdentifier:
    'bd3eb0d2-7527-4ea3-bc87-03b2180eb8bd', // EXECUTIVE_PROFILE_PERSON_RELATION_UNIVERSAL_IDENTIFIER
  universalSettings: {
    relationType: RelationType.ONE_TO_MANY,
    onDelete: OnDeleteAction.SET_NULL,
  },
});
