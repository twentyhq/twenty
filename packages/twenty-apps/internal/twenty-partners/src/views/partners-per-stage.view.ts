import { ViewType, defineView } from 'twenty-sdk/define';

import { PARTNER_OBJECT_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';

const PARTNER_NAME_FIELD_ID = 'a0000001-0000-4000-8000-000000000001';
const PARTNER_COUNTRY_FIELD_ID = 'a77d7fa6-c398-47db-af0f-036a5c719f20';
const PARTNER_SCOPE_FIELD_ID = '500021ad-ca42-4fd3-8727-392dd26b722a';
const PARTNER_TIER_FIELD_ID = 'd4fa6461-37b6-49ee-9181-dd482e74a70b';

// Prod view id — update in place (was KANBAN grouped by validationStage).
export const PARTNERS_PER_STAGE_VIEW_UNIVERSAL_IDENTIFIER =
  '46a4ccfc-6828-40cb-bbbc-6632b69bb461';

export default defineView({
  universalIdentifier: PARTNERS_PER_STAGE_VIEW_UNIVERSAL_IDENTIFIER,
  name: 'Partners per Stage',
  icon: 'IconTable',
  objectUniversalIdentifier: PARTNER_OBJECT_UNIVERSAL_IDENTIFIER,
  type: ViewType.TABLE,
  position: 0,
  fields: [
    {
      universalIdentifier: 'b5bf1bfe-593a-4dce-ac2f-9f490ed293c0',
      fieldMetadataUniversalIdentifier: PARTNER_NAME_FIELD_ID,
      position: 0,
      isVisible: true,
      size: 200,
    },
    {
      universalIdentifier: 'b728ddb6-abb8-479b-90e6-6036aae15cbb',
      fieldMetadataUniversalIdentifier: PARTNER_COUNTRY_FIELD_ID,
      position: 1,
      isVisible: true,
    },
    {
      universalIdentifier: '92117793-ca2a-45b6-9969-aaf8e2dbacea',
      fieldMetadataUniversalIdentifier: PARTNER_SCOPE_FIELD_ID,
      position: 2,
      isVisible: true,
      size: 200,
    },
    {
      universalIdentifier: 'af53167e-9f2a-416e-8c66-65d842e7ebbe',
      fieldMetadataUniversalIdentifier: PARTNER_TIER_FIELD_ID,
      position: 3,
      isVisible: true,
    },
  ],
});
