import { defineField, FieldType, RelationType, OnDeleteAction } from 'twenty-sdk/define';
import { EXECUTIVE_PROFILE_UNIVERSAL_IDENTIFIER } from '../objects/executive-profile.object';
import { EXECUTIVE_EDUCATION_UNIVERSAL_IDENTIFIER } from '../objects/executive-education.object';
import { EXECUTIVE_EDUCATION_EP_REVERSE_RELATION_UNIVERSAL_IDENTIFIER } from '../objects/executive-education.object';

export default defineField({
  universalIdentifier:
    EXECUTIVE_EDUCATION_EP_REVERSE_RELATION_UNIVERSAL_IDENTIFIER,
  objectUniversalIdentifier: EXECUTIVE_PROFILE_UNIVERSAL_IDENTIFIER,
  type: FieldType.RELATION,
  name: 'executiveEducations',
  label: 'Educations',
  relationTargetObjectMetadataUniversalIdentifier:
    EXECUTIVE_EDUCATION_UNIVERSAL_IDENTIFIER,
  relationTargetFieldMetadataUniversalIdentifier:
    'af8c8985-75b6-4dc0-b923-3e8caceeff55', // EXECUTIVE_EDUCATION_EP_RELATION_UNIVERSAL_IDENTIFIER
  universalSettings: {
    relationType: RelationType.ONE_TO_MANY,
    onDelete: OnDeleteAction.CASCADE,
  },
});
