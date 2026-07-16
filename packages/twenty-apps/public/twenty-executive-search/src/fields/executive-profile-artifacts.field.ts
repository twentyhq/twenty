import { defineField, FieldType, RelationType, OnDeleteAction } from 'twenty-sdk/define';
import { EXECUTIVE_PROFILE_UNIVERSAL_IDENTIFIER } from '../objects/executive-profile.object';
import { EXECUTIVE_ARTIFACT_UNIVERSAL_IDENTIFIER } from '../objects/executive-artifact.object';
import { EXECUTIVE_ARTIFACT_EP_REVERSE_RELATION_UNIVERSAL_IDENTIFIER } from '../objects/executive-artifact.object';

export default defineField({
  universalIdentifier:
    EXECUTIVE_ARTIFACT_EP_REVERSE_RELATION_UNIVERSAL_IDENTIFIER,
  objectUniversalIdentifier: EXECUTIVE_PROFILE_UNIVERSAL_IDENTIFIER,
  type: FieldType.RELATION,
  name: 'executiveArtifacts',
  label: 'Artifacts',
  relationTargetObjectMetadataUniversalIdentifier:
    EXECUTIVE_ARTIFACT_UNIVERSAL_IDENTIFIER,
  relationTargetFieldMetadataUniversalIdentifier:
    '0fb5205b-cc2e-4bc7-88bb-977df6c6d381', // EXECUTIVE_ARTIFACT_EP_RELATION_UNIVERSAL_IDENTIFIER
  universalSettings: {
    relationType: RelationType.ONE_TO_MANY,
    onDelete: OnDeleteAction.CASCADE,
  },
});
