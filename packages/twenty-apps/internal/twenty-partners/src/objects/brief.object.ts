import {
  FieldType,
  OnDeleteAction,
  RelationType,
  STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS,
  defineObject,
} from 'twenty-sdk/define';

export const BRIEF_OBJECT_UNIVERSAL_IDENTIFIER = 'c0a8b101-0000-4000-8000-000000000001';

// Relation field IDs — exported so reverse-field files can reference them
// without creating a circular dependency through defineField files.
export const BRIEF_OPPORTUNITY_FIELD_ID = 'c0a8b1a1-0000-4000-8000-000000000001';
export const BRIEFS_ON_OPPORTUNITY_FIELD_ID = 'c0a8b1a1-0000-4000-8000-000000000002';

export default defineObject({
  universalIdentifier: BRIEF_OBJECT_UNIVERSAL_IDENTIFIER,
  nameSingular: 'brief',
  namePlural: 'briefs',
  labelSingular: 'Brief',
  labelPlural: 'Briefs',
  description: 'The partner-facing spec for an opportunity, generated from the discovery call',
  icon: 'IconFileText',
  isSearchable: false,
  labelIdentifierFieldMetadataUniversalIdentifier: 'c0a8b101-0000-4000-8000-000000000002',
  fields: [
    {
      universalIdentifier: 'c0a8b101-0000-4000-8000-000000000002',
      type: FieldType.TEXT,
      name: 'name',
      label: 'Name',
      icon: 'IconTag',
      defaultValue: "''",
    },
    {
      universalIdentifier: BRIEF_OPPORTUNITY_FIELD_ID,
      type: FieldType.RELATION,
      name: 'opportunity',
      label: 'Opportunity',
      icon: 'IconTargetArrow',
      isNullable: true,
      relationTargetObjectMetadataUniversalIdentifier:
        STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.opportunity.universalIdentifier,
      relationTargetFieldMetadataUniversalIdentifier: BRIEFS_ON_OPPORTUNITY_FIELD_ID,
      universalSettings: {
        relationType: RelationType.MANY_TO_ONE,
        onDelete: OnDeleteAction.SET_NULL,
        joinColumnName: 'opportunityId',
      },
    },
    {
      universalIdentifier: 'c0a8b101-0000-4000-8000-000000000003',
      type: FieldType.TEXT,
      name: 'need',
      label: 'Need',
      icon: 'IconNotes',
      isNullable: true,
    },
    {
      universalIdentifier: 'c0a8b101-0000-4000-8000-000000000004',
      type: FieldType.TEXT,
      name: 'requirements',
      label: 'Requirements',
      icon: 'IconListCheck',
      isNullable: true,
    },
    {
      universalIdentifier: 'c0a8b101-0000-4000-8000-000000000005',
      type: FieldType.SELECT,
      name: 'issuedBy',
      label: 'Issued By',
      icon: 'IconUserPlus',
      isNullable: false,
      defaultValue: "'ADMIN'",
      options: [
        { id: 'c0a8b101-0000-4000-8000-000000000051', value: 'ADMIN', label: 'Admin', position: 0, color: 'blue' },
        { id: 'c0a8b101-0000-4000-8000-000000000052', value: 'CLIENT', label: 'Client', position: 1, color: 'green' },
      ],
    },
    {
      universalIdentifier: 'c0a8b101-0000-4000-8000-000000000006',
      type: FieldType.SELECT,
      name: 'status',
      label: 'Status',
      icon: 'IconProgressCheck',
      isNullable: false,
      defaultValue: "'OPEN'",
      options: [
        { id: 'c0a8b101-0000-4000-8000-000000000061', value: 'OPEN', label: 'Open', position: 0, color: 'green' },
        { id: 'c0a8b101-0000-4000-8000-000000000062', value: 'CLOSED', label: 'Closed', position: 1, color: 'gray' },
      ],
    },
    {
      universalIdentifier: 'c0a8b101-0000-4000-8000-000000000007',
      type: FieldType.UUID,
      name: 'reviewToken',
      label: 'Review Token',
      icon: 'IconLink',
      defaultValue: 'uuid',
    },
  ],
});
