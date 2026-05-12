import { defineField, FieldType, RelationType, STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS } from 'twenty-sdk/define';
import { XOPURE_CUSTOMER_OBJECT_ID } from '../objects/xopure-customer.object';
import { CUSTOMER_SUPERVISOR_FIELD_ID } from './customer-supervisor.field';

export const WORKSPACE_MEMBER_SUPERVISED_CUSTOMER_FIELD_ID =
  '65c0bba2-8fd5-5079-b5f7-dd1b3af4c9a1';

export default defineField({
  universalIdentifier: WORKSPACE_MEMBER_SUPERVISED_CUSTOMER_FIELD_ID,
  objectUniversalIdentifier:
    STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.workspaceMember.universalIdentifier,
  type: FieldType.RELATION,
  name: 'supervisedCustomers',
  label: 'Supervised Customers',
  relationTargetObjectMetadataUniversalIdentifier: XOPURE_CUSTOMER_OBJECT_ID,
  relationTargetFieldMetadataUniversalIdentifier: CUSTOMER_SUPERVISOR_FIELD_ID,
  universalSettings: {
    relationType: RelationType.ONE_TO_MANY,
  },
});
