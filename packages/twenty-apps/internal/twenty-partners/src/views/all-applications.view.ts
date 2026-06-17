import { ViewSortDirection, ViewType, defineView } from 'twenty-sdk/define';

import {
  APPLICATION_NAME_FIELD_ID,
  APPLICATION_OBJECT_UNIVERSAL_IDENTIFIER,
  APPLICATION_OPPORTUNITY_FIELD_ID,
  APPLICATION_PARTNER_FIELD_ID,
  APPLICATION_STATE_FIELD_ID,
} from 'src/objects/application.object';

// pitch/lastActivityAt ids are inline literals in application.object.ts (not exported).
const APPLICATION_LAST_ACTIVITY_AT_FIELD_ID =
  'b184ac02-51b2-4442-9505-2b06f5c94112';

export const ALL_APPLICATIONS_VIEW_UNIVERSAL_IDENTIFIER =
  '787fa2e8-c2bf-436b-893d-9e3146dde470';

// All applications, most-recent activity first. Lets ops see candidacies and verify the
// auto-label + WON mirror (B3) before the partner-facing views ship in B4.
export default defineView({
  universalIdentifier: ALL_APPLICATIONS_VIEW_UNIVERSAL_IDENTIFIER,
  name: 'Applications',
  icon: 'IconSend',
  objectUniversalIdentifier: APPLICATION_OBJECT_UNIVERSAL_IDENTIFIER,
  type: ViewType.TABLE,
  position: 4,
  fields: [
    { universalIdentifier: '4868f5e2-cdb0-4867-970c-42be9688b8a3', fieldMetadataUniversalIdentifier: APPLICATION_NAME_FIELD_ID, position: 0, isVisible: true, size: 220 },
    { universalIdentifier: '98f4b085-ea81-491f-acbd-7df283740ad0', fieldMetadataUniversalIdentifier: APPLICATION_OPPORTUNITY_FIELD_ID, position: 1, isVisible: true, size: 200 },
    { universalIdentifier: '6afd7223-5ac0-4147-af32-6456f3fdd4a4', fieldMetadataUniversalIdentifier: APPLICATION_PARTNER_FIELD_ID, position: 2, isVisible: true, size: 200 },
    { universalIdentifier: '1c1e9ca2-746a-4dde-a1dc-22f0160474d1', fieldMetadataUniversalIdentifier: APPLICATION_STATE_FIELD_ID, position: 3, isVisible: true, size: 140 },
    { universalIdentifier: '3eab4f3a-0460-4095-a02f-f87a3b3146bf', fieldMetadataUniversalIdentifier: APPLICATION_LAST_ACTIVITY_AT_FIELD_ID, position: 4, isVisible: true, size: 180 },
  ],
  sorts: [
    {
      universalIdentifier: '4197dc31-4b18-42b2-9c57-2971ab919661',
      fieldMetadataUniversalIdentifier: APPLICATION_LAST_ACTIVITY_AT_FIELD_ID,
      direction: ViewSortDirection.DESC,
    },
  ],
});
