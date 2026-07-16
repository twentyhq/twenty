import { defineObject, FieldType, RelationType } from 'twenty-sdk/define';
import { EXECUTIVE_PROFILE_UNIVERSAL_IDENTIFIER } from './executive-profile.object';

export const EXECUTIVE_CAREER_EXPERIENCE_UNIVERSAL_IDENTIFIER =
  '5ac11407-b607-4d14-adb1-251ff4dc3f24';

export const EXECUTIVE_CAREER_EXPERIENCE_EP_RELATION_UNIVERSAL_IDENTIFIER =
  '6010defe-b80c-46c7-acf5-d3cbdcbf85bd';

export const EXECUTIVE_CAREER_EXPERIENCE_EP_REVERSE_RELATION_UNIVERSAL_IDENTIFIER =
  '6968a228-dacc-4a25-8fb1-c4d2a3e9a453';

export default defineObject({
  universalIdentifier: EXECUTIVE_CAREER_EXPERIENCE_UNIVERSAL_IDENTIFIER,
  nameSingular: 'executiveCareerExperience',
  namePlural: 'executiveCareerExperiences',
  labelSingular: 'Career Experience',
  labelPlural: 'Career Experiences',
  description:
    'A single career position held by the executive (company, title, dates, summary, candidate-confirmed status).',
  icon: 'IconBriefcase',
  labelIdentifierFieldMetadataUniversalIdentifier:
    'a372f098-3075-43ac-bfb2-77f5205dfe50',
  fields: [
    // MANY_TO_ONE to executiveProfile
    {
      universalIdentifier:
        EXECUTIVE_CAREER_EXPERIENCE_EP_RELATION_UNIVERSAL_IDENTIFIER,
      type: FieldType.RELATION,
      name: 'executiveProfile',
      label: 'Executive Profile',
      description: 'The parent executive profile.',
      relationTargetObjectMetadataUniversalIdentifier:
        EXECUTIVE_PROFILE_UNIVERSAL_IDENTIFIER,
      relationTargetFieldMetadataUniversalIdentifier:
        EXECUTIVE_CAREER_EXPERIENCE_EP_REVERSE_RELATION_UNIVERSAL_IDENTIFIER,
      universalSettings: {
        relationType: RelationType.MANY_TO_ONE,
      },
    },
    {
      universalIdentifier: '02ff2f0c-94bd-4d8a-82a1-791ec97b6270',
      type: FieldType.TEXT,
      label: 'Company',
      description: 'Employer or client company name.',
      icon: 'IconBuilding',
      name: 'company',
    },
    {
      universalIdentifier: 'a372f098-3075-43ac-bfb2-77f5205dfe50',
      type: FieldType.TEXT,
      label: 'Title',
      description: 'Job title held at the company.',
      icon: 'IconUser',
      name: 'title',
    },
    {
      universalIdentifier: '8efe95d8-bd63-49f8-b3c3-38c2cb35431d',
      type: FieldType.DATE,
      label: 'Start Date',
      description: 'Start date of the position.',
      icon: 'IconCalendar',
      name: 'startDate',
      isNullable: true,
      defaultValue: null,
    },
    {
      universalIdentifier: 'b8e9e2f0-ccb2-4be1-ab8a-9ab6803b2abb',
      type: FieldType.DATE,
      label: 'End Date',
      description: 'End date of the position (null if current).',
      icon: 'IconCalendarOff',
      name: 'endDate',
      isNullable: true,
      defaultValue: null,
    },
    {
      universalIdentifier: '16799281-ec51-4ba5-9499-f5e3fbd8d87b',
      type: FieldType.TEXT,
      label: 'Summary',
      description: 'Summary of responsibilities and achievements.',
      icon: 'IconFileDescription',
      name: 'summary',
      isNullable: true,
      defaultValue: null,
    },
    {
      universalIdentifier: '53fc41b7-7b59-479b-820c-a13d43d74b73',
      type: FieldType.BOOLEAN,
      label: 'Candidate Confirmed',
      description: 'Whether the candidate has confirmed this experience entry.',
      icon: 'IconCheck',
      name: 'candidateConfirmed',
      defaultValue: `'false'`,
    },
    {
      universalIdentifier: '8fbb53b7-6cb6-41d2-9e69-16a68384775b',
      type: FieldType.TEXT,
      label: 'Source Hash',
      description: 'Content hash from the source system.',
      icon: 'IconHash',
      name: 'sourceHash',
      isNullable: true,
      defaultValue: null,
    },
  ],
  indexes: [
    {
      universalIdentifier: '28013f3e-ad2c-4685-932b-f4fb962a8318',
      objectUniversalIdentifier:
        EXECUTIVE_CAREER_EXPERIENCE_UNIVERSAL_IDENTIFIER,
      name: 'idx_executiveCareerExperience_executiveProfileId',
      fields: [
        {
          universalIdentifier: 'c041193b-4bdd-4a5f-8b22-f93e61d0bb3f',
          fieldName: 'executiveProfile',
        },
      ],
    },
  ],
});
