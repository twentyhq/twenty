import { defineField, FieldType, RelationType, STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS } from 'twenty-sdk/define';
import { XOPURE_COMMISSION_OBJECT_ID } from '../objects/xopure-commission.object';
import { COMMISSION_ASSIGNED_AMBASSADOR_FIELD_ID } from './commission-assigned-ambassador.field';

export const WORKSPACE_MEMBER_ASSIGNED_COMMISSION_FIELD_ID =
  '25b2c3ed-9a5e-5f46-8801-e0f9869ef6a1';

export default defineField({
  universalIdentifier: WORKSPACE_MEMBER_ASSIGNED_COMMISSION_FIELD_ID,
  objectUniversalIdentifier:
    STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.workspaceMember.universalIdentifier,
  type: FieldType.RELATION,
  name: 'assignedCommissions',
  label: 'Assigned Commissions',
  relationTargetObjectMetadataUniversalIdentifier: XOPURE_COMMISSION_OBJECT_ID,
  relationTargetFieldMetadataUniversalIdentifier: COMMISSION_ASSIGNED_AMBASSADOR_FIELD_ID,
  universalSettings: {
    relationType: RelationType.ONE_TO_MANY,
  },
});
