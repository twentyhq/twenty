import { defineView, ViewType } from 'twenty-sdk/define';
import { XOPURE_COMMISSION_OBJECT_ID, XOPURE_COMMISSION_NAME_FIELD_ID, XOPURE_COMMISSION_STATUS_FIELD_ID } from '../objects/xopure-commission.object';
import { COMMISSION_ASSIGNED_AMBASSADOR_FIELD_ID } from '../fields/commission-assigned-ambassador.field';

export default defineView({
  universalIdentifier: '1f0cb07f-946d-5c1c-b223-756a33b3daa6',
  name: 'My Commissions',
  objectUniversalIdentifier: XOPURE_COMMISSION_OBJECT_ID,
  type: ViewType.TABLE,
  icon: 'IconCash',
  position: 1,
  fields: [
    { universalIdentifier: 'e0f1d2c3-b4a5-4968-8790-abcd12345678', fieldMetadataUniversalIdentifier: XOPURE_COMMISSION_NAME_FIELD_ID, position: 0, isVisible: true, size: 220 },
    { universalIdentifier: 'f1e2d3c4-b5a6-4978-9870-bcde23456789', fieldMetadataUniversalIdentifier: XOPURE_COMMISSION_STATUS_FIELD_ID, position: 1, isVisible: true, size: 160 },
    { universalIdentifier: '02f3e4d5-c6a7-4988-a960-cdef34567890', fieldMetadataUniversalIdentifier: COMMISSION_ASSIGNED_AMBASSADOR_FIELD_ID, position: 2, isVisible: true, size: 200 },
  ],
});
