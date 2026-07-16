import { defineField, FieldType, RelationType, OnDeleteAction } from 'twenty-sdk/define';
import { EXECUTIVE_PROFILE_UNIVERSAL_IDENTIFIER } from '../objects/executive-profile.object';
import { EXECUTIVE_SEARCH_PREFERENCE_UNIVERSAL_IDENTIFIER } from '../objects/executive-search-preference.object';
import { EXECUTIVE_SEARCH_PREFERENCE_EP_REVERSE_RELATION_UNIVERSAL_IDENTIFIER } from '../objects/executive-search-preference.object';

export default defineField({
  universalIdentifier:
    EXECUTIVE_SEARCH_PREFERENCE_EP_REVERSE_RELATION_UNIVERSAL_IDENTIFIER,
  objectUniversalIdentifier: EXECUTIVE_PROFILE_UNIVERSAL_IDENTIFIER,
  type: FieldType.RELATION,
  name: 'executiveSearchPreferences',
  label: 'Search Preferences',
  relationTargetObjectMetadataUniversalIdentifier:
    EXECUTIVE_SEARCH_PREFERENCE_UNIVERSAL_IDENTIFIER,
  relationTargetFieldMetadataUniversalIdentifier:
    '33ea88f5-78ec-4f85-afc8-af07cfaff5f1', // EXECUTIVE_SEARCH_PREFERENCE_EP_RELATION_UNIVERSAL_IDENTIFIER
  universalSettings: {
    relationType: RelationType.ONE_TO_MANY,
    onDelete: OnDeleteAction.CASCADE,
  },
});
