import { defineField, FieldType, RelationType, OnDeleteAction } from 'twenty-sdk/define';
import { EXECUTIVE_PROFILE_UNIVERSAL_IDENTIFIER } from '../objects/executive-profile.object';
import { EXECUTIVE_CAPABILITY_UNIVERSAL_IDENTIFIER } from '../objects/executive-capability.object';
import { EXECUTIVE_CAPABILITY_EP_REVERSE_RELATION_UNIVERSAL_IDENTIFIER } from '../objects/executive-capability.object';

export default defineField({
  universalIdentifier:
    EXECUTIVE_CAPABILITY_EP_REVERSE_RELATION_UNIVERSAL_IDENTIFIER,
  objectUniversalIdentifier: EXECUTIVE_PROFILE_UNIVERSAL_IDENTIFIER,
  type: FieldType.RELATION,
  name: 'executiveCapabilities',
  label: 'Capabilities',
  relationTargetObjectMetadataUniversalIdentifier:
    EXECUTIVE_CAPABILITY_UNIVERSAL_IDENTIFIER,
  relationTargetFieldMetadataUniversalIdentifier:
    '78755b8e-03b1-4f92-83c0-fe14af5fb32b', // EXECUTIVE_CAPABILITY_EP_RELATION_UNIVERSAL_IDENTIFIER
  universalSettings: {
    relationType: RelationType.ONE_TO_MANY,
    onDelete: OnDeleteAction.CASCADE,
  },
});
