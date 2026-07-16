import { defineField, FieldType, RelationType, OnDeleteAction } from 'twenty-sdk/define';
import { EXECUTIVE_PROFILE_UNIVERSAL_IDENTIFIER } from '../objects/executive-profile.object';
import { EXECUTIVE_CAREER_EXPERIENCE_UNIVERSAL_IDENTIFIER } from '../objects/executive-career-experience.object';
import { EXECUTIVE_CAREER_EXPERIENCE_EP_REVERSE_RELATION_UNIVERSAL_IDENTIFIER } from '../objects/executive-career-experience.object';

export default defineField({
  universalIdentifier:
    EXECUTIVE_CAREER_EXPERIENCE_EP_REVERSE_RELATION_UNIVERSAL_IDENTIFIER,
  objectUniversalIdentifier: EXECUTIVE_PROFILE_UNIVERSAL_IDENTIFIER,
  type: FieldType.RELATION,
  name: 'executiveCareerExperiences',
  label: 'Career Experiences',
  relationTargetObjectMetadataUniversalIdentifier:
    EXECUTIVE_CAREER_EXPERIENCE_UNIVERSAL_IDENTIFIER,
  relationTargetFieldMetadataUniversalIdentifier:
    '6010defe-b80c-46c7-acf5-d3cbdcbf85bd', // EXECUTIVE_CAREER_EXPERIENCE_EP_RELATION_UNIVERSAL_IDENTIFIER
  universalSettings: {
    relationType: RelationType.ONE_TO_MANY,
    onDelete: OnDeleteAction.CASCADE,
  },
});
