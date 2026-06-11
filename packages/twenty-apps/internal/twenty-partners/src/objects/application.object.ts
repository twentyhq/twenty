import {
  FieldType,
  OnDeleteAction,
  RelationType,
  defineObject,
} from 'twenty-sdk/define';

import { PARTNER_OBJECT_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import { BRIEF_OBJECT_UNIVERSAL_IDENTIFIER } from 'src/objects/brief.object';

export const APPLICATION_OBJECT_UNIVERSAL_IDENTIFIER = 'c0a8b102-0000-4000-8000-000000000001';

// Relation field IDs — exported for reverse-field files.
export const APPLICATION_BRIEF_FIELD_ID = 'c0a8b1a2-0000-4000-8000-000000000001';
export const APPLICATIONS_ON_BRIEF_FIELD_ID = 'c0a8b1a2-0000-4000-8000-000000000002';
export const APPLICATION_PARTNER_FIELD_ID = 'c0a8b1a3-0000-4000-8000-000000000001';
export const APPLICATIONS_ON_PARTNER_FIELD_ID = 'c0a8b1a3-0000-4000-8000-000000000002';

export default defineObject({
  universalIdentifier: APPLICATION_OBJECT_UNIVERSAL_IDENTIFIER,
  nameSingular: 'application',
  namePlural: 'applications',
  labelSingular: 'Application',
  labelPlural: 'Applications',
  description: 'A partner in play on a brief — invited or applied',
  icon: 'IconSend',
  isSearchable: false,
  labelIdentifierFieldMetadataUniversalIdentifier: 'c0a8b102-0000-4000-8000-000000000002',
  fields: [
    {
      universalIdentifier: 'c0a8b102-0000-4000-8000-000000000002',
      type: FieldType.TEXT,
      name: 'name',
      label: 'Name',
      icon: 'IconTag',
      defaultValue: "''",
    },
    {
      universalIdentifier: APPLICATION_BRIEF_FIELD_ID,
      type: FieldType.RELATION,
      name: 'brief',
      label: 'Brief',
      icon: 'IconFileText',
      isNullable: true,
      relationTargetObjectMetadataUniversalIdentifier: BRIEF_OBJECT_UNIVERSAL_IDENTIFIER,
      relationTargetFieldMetadataUniversalIdentifier: APPLICATIONS_ON_BRIEF_FIELD_ID,
      universalSettings: {
        relationType: RelationType.MANY_TO_ONE,
        onDelete: OnDeleteAction.SET_NULL,
        joinColumnName: 'briefId',
      },
    },
    {
      universalIdentifier: APPLICATION_PARTNER_FIELD_ID,
      type: FieldType.RELATION,
      name: 'partner',
      label: 'Partner',
      icon: 'IconBuildingStore',
      isNullable: true,
      relationTargetObjectMetadataUniversalIdentifier: PARTNER_OBJECT_UNIVERSAL_IDENTIFIER,
      relationTargetFieldMetadataUniversalIdentifier: APPLICATIONS_ON_PARTNER_FIELD_ID,
      universalSettings: {
        relationType: RelationType.MANY_TO_ONE,
        onDelete: OnDeleteAction.SET_NULL,
        joinColumnName: 'partnerId',
      },
    },
    {
      universalIdentifier: 'c0a8b102-0000-4000-8000-000000000003',
      type: FieldType.SELECT,
      name: 'state',
      label: 'State',
      icon: 'IconProgressCheck',
      isNullable: false,
      defaultValue: "'INVITED'",
      options: [
        { id: 'c0a8b102-0000-4000-8000-000000000031', value: 'INVITED', label: 'Invited', position: 0, color: 'gray' },
        { id: 'c0a8b102-0000-4000-8000-000000000032', value: 'APPLIED', label: 'Applied', position: 1, color: 'blue' },
        { id: 'c0a8b102-0000-4000-8000-000000000033', value: 'INTRODUCED', label: 'Introduced', position: 2, color: 'purple' },
        { id: 'c0a8b102-0000-4000-8000-000000000034', value: 'BACKUP', label: 'Backup', position: 3, color: 'orange' },
        { id: 'c0a8b102-0000-4000-8000-000000000035', value: 'DECLINED', label: 'Declined', position: 4, color: 'red' },
      ],
    },
    {
      universalIdentifier: 'c0a8b102-0000-4000-8000-000000000004',
      type: FieldType.SELECT,
      name: 'invitedBy',
      label: 'Invited By',
      icon: 'IconUserPlus',
      isNullable: false,
      defaultValue: "'ADMIN'",
      options: [
        { id: 'c0a8b102-0000-4000-8000-000000000041', value: 'ADMIN', label: 'Admin', position: 0, color: 'blue' },
        { id: 'c0a8b102-0000-4000-8000-000000000042', value: 'CLIENT', label: 'Client', position: 1, color: 'green' },
      ],
    },
    {
      universalIdentifier: 'c0a8b102-0000-4000-8000-000000000005',
      type: FieldType.TEXT,
      name: 'pitch',
      label: 'Pitch',
      icon: 'IconMessage',
      isNullable: true,
    },
    {
      universalIdentifier: 'c0a8b102-0000-4000-8000-000000000007',
      type: FieldType.DATE_TIME,
      name: 'lastActivityAt',
      label: 'Last Activity At',
      icon: 'IconClock',
      isNullable: true,
    },
    {
      universalIdentifier: 'c0a8b102-0000-4000-8000-000000000008',
      type: FieldType.SELECT,
      name: 'outcome',
      label: 'Outcome',
      icon: 'IconFlag',
      isNullable: false,
      defaultValue: "'PENDING'",
      options: [
        { id: 'c0a8b102-0000-4000-8000-000000000081', value: 'PENDING', label: 'Pending', position: 0, color: 'gray' },
        { id: 'c0a8b102-0000-4000-8000-000000000082', value: 'MET', label: 'Met', position: 1, color: 'blue' },
        { id: 'c0a8b102-0000-4000-8000-000000000083', value: 'WON', label: 'Won', position: 2, color: 'green' },
        { id: 'c0a8b102-0000-4000-8000-000000000084', value: 'LOST', label: 'Lost', position: 3, color: 'red' },
      ],
    },
    {
      universalIdentifier: 'c0a8b102-0000-4000-8000-000000000009',
      type: FieldType.DATE_TIME,
      name: 'selectedAt',
      label: 'Selected At',
      icon: 'IconCalendarCheck',
      isNullable: true,
    },
    {
      universalIdentifier: 'c0a8b102-0000-4000-8000-000000000010',
      type: FieldType.DATE_TIME,
      name: 'introSentAt',
      label: 'Intro Sent At',
      icon: 'IconSend',
      isNullable: true,
    },
  ],
});
