import { defineView, ViewType } from 'twenty-sdk/define';
import { XOPURE_COMMISSION_OBJECT_ID, XOPURE_COMMISSION_NAME_FIELD_ID, XOPURE_COMMISSION_STATUS_FIELD_ID } from '../objects/xopure-commission.object';
import { COMMISSION_SUPERVISOR_FIELD_ID } from '../fields/commission-supervisor.field';

export default defineView({
  universalIdentifier: 'cb8407cb-35c3-5336-becf-58995b35582b',
  name: 'Team Commissions',
  objectUniversalIdentifier: XOPURE_COMMISSION_OBJECT_ID,
  type: ViewType.TABLE,
  icon: 'IconCash',
  position: 2,
  fields: [
    { universalIdentifier: '13a4b5c6-d7e8-4998-b070-defa45678901', fieldMetadataUniversalIdentifier: XOPURE_COMMISSION_NAME_FIELD_ID, position: 0, isVisible: true, size: 220 },
    { universalIdentifier: '24b5c6d7-e8f9-4008-c180-efab56789012', fieldMetadataUniversalIdentifier: XOPURE_COMMISSION_STATUS_FIELD_ID, position: 1, isVisible: true, size: 160 },
    { universalIdentifier: '35c6d7e8-f9a0-4118-d290-fgab67890123', fieldMetadataUniversalIdentifier: COMMISSION_SUPERVISOR_FIELD_ID, position: 2, isVisible: true, size: 200 },
  ],
});
