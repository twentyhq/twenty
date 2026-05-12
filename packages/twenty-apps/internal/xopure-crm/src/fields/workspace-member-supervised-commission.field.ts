import { defineField, FieldType, RelationType, STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS } from 'twenty-sdk/define';
import { XOPURE_COMMISSION_OBJECT_ID } from '../objects/xopure-commission.object';
import { COMMISSION_SUPERVISOR_FIELD_ID } from './commission-supervisor.field';

export const WORKSPACE_MEMBER_SUPERVISED_COMMISSION_FIELD_ID =
  '4d206f1a-e4e7-524d-81d8-c64143752f49';

export default defineField({
  universalIdentifier: WORKSPACE_MEMBER_SUPERVISED_COMMISSION_FIELD_ID,
  objectUniversalIdentifier:
    STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.workspaceMember.universalIdentifier,
  type: FieldType.RELATION,
  name: 'supervisedCommissions',
  label: 'Supervised Commissions',
  relationTargetObjectMetadataUniversalIdentifier: XOPURE_COMMISSION_OBJECT_ID,
  relationTargetFieldMetadataUniversalIdentifier: COMMISSION_SUPERVISOR_FIELD_ID,
  universalSettings: {
    relationType: RelationType.ONE_TO_MANY,
  },
});
