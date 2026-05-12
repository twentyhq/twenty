import { defineField, FieldType, RelationType, STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS } from 'twenty-sdk/define';
import { XOPURE_AMBASSADOR_OBJECT_ID } from '../objects/xopure-ambassador.object';
import { AMBASSADOR_MANAGER_WORKSPACE_MEMBER_FIELD_ID } from './ambassador-manager-workspace-member.field';

export const WORKSPACE_MEMBER_MANAGED_AMBASSADORS_FIELD_ID =
  'ca1405c8-c1a4-531b-98af-8f25c5cd8274';

export default defineField({
  universalIdentifier: WORKSPACE_MEMBER_MANAGED_AMBASSADORS_FIELD_ID,
  objectUniversalIdentifier:
    STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.workspaceMember.universalIdentifier,
  type: FieldType.RELATION,
  name: 'managedAmbassadors',
  label: 'Managed Ambassadors',
  relationTargetObjectMetadataUniversalIdentifier: XOPURE_AMBASSADOR_OBJECT_ID,
  relationTargetFieldMetadataUniversalIdentifier: AMBASSADOR_MANAGER_WORKSPACE_MEMBER_FIELD_ID,
  universalSettings: {
    relationType: RelationType.ONE_TO_MANY,
  },
});
