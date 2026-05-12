import { defineView, ViewType } from 'twenty-sdk/define';
import { XOPURE_COMMISSION_NAME_FIELD_ID, XOPURE_COMMISSION_STATUS_FIELD_ID, XOPURE_COMMISSION_OBJECT_ID } from '../objects/xopure-commission.object';
import { COMMISSION_ASSIGNED_AMBASSADOR_FIELD_ID } from '../fields/commission-assigned-ambassador.field';
import { COMMISSION_SUPERVISOR_FIELD_ID } from '../fields/commission-supervisor.field';

export default defineView({
  universalIdentifier: '9f6acc67-ccc4-5f82-9b71-3a61e835a82d',
  name: 'Commission Review',
  objectUniversalIdentifier: XOPURE_COMMISSION_OBJECT_ID,
  type: ViewType.TABLE,
  icon: 'IconReceiptDollar',
  position: 3,
  fields: [
    { universalIdentifier: '2b8a0f1a-b345-5467-cd78-9e0f1a2b3c4d', fieldMetadataUniversalIdentifier: XOPURE_COMMISSION_NAME_FIELD_ID, position: 0, isVisible: true, size: 220 },
    { universalIdentifier: '3c9b1a2b-c456-5578-de89-0f1a2b3c4d5e', fieldMetadataUniversalIdentifier: XOPURE_COMMISSION_STATUS_FIELD_ID, position: 1, isVisible: true, size: 160 },
    { universalIdentifier: '4d0c2b3c-d567-5689-ef90-1a2b3c4d5e6f', fieldMetadataUniversalIdentifier: COMMISSION_ASSIGNED_AMBASSADOR_FIELD_ID, position: 2, isVisible: true, size: 200 },
    { universalIdentifier: '5e1d3c4d-e678-5790-fa01-2b3c4d5e6f7a', fieldMetadataUniversalIdentifier: COMMISSION_SUPERVISOR_FIELD_ID, position: 3, isVisible: true, size: 200 },
  ],
});
