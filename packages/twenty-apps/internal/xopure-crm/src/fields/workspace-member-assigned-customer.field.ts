import { defineField, FieldType, RelationType, STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS } from 'twenty-sdk/define';
import { XOPURE_CUSTOMER_OBJECT_ID } from '../objects/xopure-customer.object';
import { CUSTOMER_ASSIGNED_AMBASSADOR_FIELD_ID } from './customer-assigned-ambassador.field';

export const WORKSPACE_MEMBER_ASSIGNED_CUSTOMER_FIELD_ID =
  '7a20731c-61fc-5c60-a36c-cda68f3d9b13';

export default defineField({
  universalIdentifier: WORKSPACE_MEMBER_ASSIGNED_CUSTOMER_FIELD_ID,
  objectUniversalIdentifier:
    STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.workspaceMember.universalIdentifier,
  type: FieldType.RELATION,
  name: 'assignedCustomers',
  label: 'Assigned Customers',
  relationTargetObjectMetadataUniversalIdentifier: XOPURE_CUSTOMER_OBJECT_ID,
  relationTargetFieldMetadataUniversalIdentifier: CUSTOMER_ASSIGNED_AMBASSADOR_FIELD_ID,
  universalSettings: {
    relationType: RelationType.ONE_TO_MANY,
  },
});
