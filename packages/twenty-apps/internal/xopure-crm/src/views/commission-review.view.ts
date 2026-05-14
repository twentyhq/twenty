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
    { universalIdentifier: 'c86154ce-d727-4b08-9ff9-aa13d933de38', fieldMetadataUniversalIdentifier: XOPURE_COMMISSION_NAME_FIELD_ID, position: 0, isVisible: true, size: 220 },
    { universalIdentifier: 'fff66914-53cb-4b51-8091-9875c59f23c5', fieldMetadataUniversalIdentifier: XOPURE_COMMISSION_STATUS_FIELD_ID, position: 1, isVisible: true, size: 160 },
    { universalIdentifier: '74ec00b2-18e0-4b01-ba50-10d89a4a4695', fieldMetadataUniversalIdentifier: COMMISSION_ASSIGNED_AMBASSADOR_FIELD_ID, position: 2, isVisible: true, size: 200 },
    { universalIdentifier: '9c68950b-a37e-474c-a848-a5f7631d00f8', fieldMetadataUniversalIdentifier: COMMISSION_SUPERVISOR_FIELD_ID, position: 3, isVisible: true, size: 200 },
  ],
});
